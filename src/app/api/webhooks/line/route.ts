import { NextRequest, NextResponse } from 'next/server'
import { getLineCredentials, getLineClient, verifySignature } from '@/lib/line/client'
import { createClient } from '@supabase/supabase-js'
import { SignJWT } from 'jose'
import crypto from 'crypto'

// ============================================================
// LINE Webhook Handler
// Receives events from LINE platform and dispatches them
// Supports: Shadow Account auto-registration + Magic Link checkout
// ============================================================

// Disable body parsing - we need raw body for signature verification
export const dynamic = 'force-dynamic'

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

// ============================================================
// JWT Magic Link Helper
// ============================================================

async function generateMagicLinkToken(
    authUserId: string,
    tenantId: string
): Promise<string> {
    const secret = new TextEncoder().encode(process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const token = await new SignJWT({
        sub: authUserId,
        tenant_id: tenantId,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret)
    return token
}

function buildMagicLinkUrl(token: string): string {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return `${siteUrl}/api/auth/line-magic-login?token=${token}`
}

// ============================================================
// Shadow Account Helper
// Creates an auth user + customer record for a LINE user
// ============================================================

async function getOrCreateCustomer(
    adminClient: any,
    lineClient: any,
    tenantId: string,
    lineUserId: string
): Promise<{ id: string; name: string; authUserId: string; isNew: boolean } | null> {
    // 1. Check if customer already exists
    const { data: existing } = await adminClient
        .from('customers')
        .select('id, name, auth_user_id')
        .eq('tenant_id', tenantId)
        .eq('line_user_id', lineUserId)
        .single()

    if (existing) {
        return {
            id: existing.id,
            name: existing.name || 'LINE User',
            authUserId: existing.auth_user_id,
            isNew: false,
        }
    }

    // 2. Customer not found → Create Shadow Account
    console.log('[LINE Shadow] Creating shadow account for:', lineUserId)

    // 2a. Get LINE profile for display name
    let displayName = 'LINE User'
    try {
        const profile = await lineClient.getProfile(lineUserId)
        displayName = profile.displayName || 'LINE User'
        console.log('[LINE Shadow] Got profile:', displayName)
    } catch (err) {
        console.warn('[LINE Shadow] Failed to get LINE profile, using default name:', err)
    }

    // 2b. Create auth user (shadow / ghost account)
    const placeholderEmail = `line_${lineUserId}@placeholder.com`
    const randomPassword = crypto.randomBytes(32).toString('hex')

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: placeholderEmail,
        password: randomPassword,
        email_confirm: true, // Skip email verification
        user_metadata: {
            full_name: displayName,
            source: 'line_bot',
            line_user_id: lineUserId,
        },
    })

    if (authError) {
        // Check if user already exists (race condition or previous partial creation)
        if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
            console.log('[LINE Shadow] Auth user already exists, looking up...')
            // Find the existing auth user by email
            const { data: users } = await adminClient.auth.admin.listUsers()
            const existingUser = users?.users?.find((u: any) => u.email === placeholderEmail)
            if (existingUser) {
                // Create the missing customer record
                const { data: newCustomer, error: custError } = await adminClient
                    .from('customers')
                    .insert({
                        tenant_id: tenantId,
                        auth_user_id: existingUser.id,
                        line_user_id: lineUserId,
                        line_display_name: displayName,
                        name: displayName,
                        email: placeholderEmail,
                    })
                    .select('id')
                    .single()

                if (custError) {
                    console.error('[LINE Shadow] Failed to create customer for existing auth user:', custError)
                    return null
                }
                return { id: newCustomer.id, name: displayName, authUserId: existingUser.id, isNew: true }
            }
        }
        console.error('[LINE Shadow] Failed to create auth user:', authError)
        return null
    }

    const authUserId = authData.user.id
    console.log('[LINE Shadow] Created auth user:', authUserId)

    // 2c. Create customer record
    const { data: newCustomer, error: custError } = await adminClient
        .from('customers')
        .insert({
            tenant_id: tenantId,
            auth_user_id: authUserId,
            line_user_id: lineUserId,
            line_display_name: displayName,
            name: displayName,
            email: placeholderEmail,
        })
        .select('id')
        .single()

    if (custError) {
        console.error('[LINE Shadow] Failed to create customer record:', custError)
        // Clean up: delete the auth user we just created
        await adminClient.auth.admin.deleteUser(authUserId)
        return null
    }

    console.log('[LINE Shadow] Created customer:', newCustomer.id)
    return { id: newCustomer.id, name: displayName, authUserId, isNew: true }
}

// ============================================================
// Flex Message: Checkout Button with Magic Link
// ============================================================

function buildCheckoutFlexMessage(
    product: any,
    quantity: number,
    variant: string | null,
    totalPrice: number,
    magicLinkUrl: string,
    isNewUser: boolean
): any {
    const bodyContents: any[] = [
        {
            type: 'text',
            text: '🛒 已加入購物車',
            weight: 'bold',
            size: 'lg',
            color: '#1a1a1a',
        },
        {
            type: 'separator',
            margin: 'md',
        },
        {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
                {
                    type: 'text',
                    text: product.name + (variant ? ` (${variant})` : ''),
                    size: 'sm',
                    flex: 3,
                    wrap: true,
                },
                {
                    type: 'text',
                    text: `x${quantity}`,
                    size: 'sm',
                    align: 'end',
                    flex: 1,
                },
            ],
        },
        {
            type: 'box',
            layout: 'horizontal',
            margin: 'sm',
            contents: [
                {
                    type: 'text',
                    text: '小計',
                    size: 'sm',
                    color: '#888888',
                    flex: 3,
                },
                {
                    type: 'text',
                    text: `NT$${totalPrice.toLocaleString()}`,
                    size: 'sm',
                    weight: 'bold',
                    align: 'end',
                    flex: 1,
                },
            ],
        },
    ]

    if (isNewUser) {
        bodyContents.push({
            type: 'text',
            text: '✨ 已為您自動建立帳號',
            size: 'xs',
            color: '#27ae60',
            margin: 'md',
        })
    }

    return {
        type: 'flex',
        altText: `✅ 已將 ${product.name} x${quantity} 加入購物車 - NT$${totalPrice}`,
        contents: {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                spacing: 'md',
                paddingAll: '20px',
                contents: bodyContents,
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                paddingAll: '16px',
                contents: [
                    {
                        type: 'button',
                        style: 'primary',
                        color: '#1a1a1a',
                        height: 'md',
                        action: {
                            type: 'uri',
                            label: '🛒 前往結帳',
                            uri: magicLinkUrl,
                        },
                    },
                ],
            },
        },
    }
}

export async function POST(request: NextRequest) {
    // 1. Get tenant ID from query param
    const tenantId = request.nextUrl.searchParams.get('tenant')
    if (!tenantId) {
        return NextResponse.json({ error: 'Missing tenant parameter' }, { status: 400 })
    }

    // 2. Get raw body for signature verification
    const rawBody = await request.text()

    // 3. Get LINE credentials
    const credentials = await getLineCredentials(tenantId)
    if (!credentials) {
        return NextResponse.json({ error: 'LINE not configured for this tenant' }, { status: 400 })
    }

    // 4. Verify signature
    const signature = request.headers.get('x-line-signature')
    if (!signature || !verifySignature(credentials.channelSecret, signature, rawBody)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // 5. Parse events
    const body = JSON.parse(rawBody)
    const events = body.events || []

    // 6. Process each event
    const client = await getLineClient(tenantId)
    if (!client) {
        return NextResponse.json({ error: 'Failed to initialize LINE client' }, { status: 500 })
    }

    const adminClient = getAdminClient()

    for (const event of events) {
        try {
            await handleEvent(event, tenantId, client, adminClient)
        } catch (err) {
            console.error('[LINE Webhook] Error handling event:', err)
        }
    }

    return NextResponse.json({ ok: true })
}

// GET for LINE webhook verification
export async function GET() {
    return NextResponse.json({ status: 'ok' })
}

// ============================================================
// Event Handlers
// ============================================================

async function handleEvent(
    event: any,
    tenantId: string,
    client: any,
    adminClient: any
) {
    switch (event.type) {
        case 'follow':
            await handleFollow(event, tenantId, client, adminClient)
            break
        case 'message':
            if (event.message.type === 'text') {
                await handleTextMessage(event, tenantId, client, adminClient)
            }
            break
        case 'postback':
            await handlePostback(event, tenantId, client, adminClient)
            break
        default:
            // Unhandled event type
            break
    }
}

/**
 * Handle follow event (new friend / unblock)
 * Send customized welcome message
 */
async function handleFollow(
    event: any,
    tenantId: string,
    client: any,
    adminClient: any
) {
    const lineUserId = event.source.userId
    if (!lineUserId) return

    // Get tenant's welcome message
    const { data: tenant } = await adminClient
        .from('tenants')
        .select('settings, name')
        .eq('id', tenantId)
        .single()

    const settings = (tenant?.settings as Record<string, any>) || {}
    const welcomeMessage = settings.line?.welcome_message ||
        `歡迎加入${tenant?.name || '我們的商店'}！🎉\n請點擊下方選單綁定會員帳號，即可享用 LINE 快速下單服務。`

    await client.pushMessage({
        to: lineUserId,
        messages: [{ type: 'text', text: welcomeMessage }],
    })
}

/**
 * Handle text messages
 * Check for "+1" ordering pattern
 * Auto-creates Shadow Account if user not found
 * Returns Flex Message with Magic Link for one-click checkout
 */
async function handleTextMessage(
    event: any,
    tenantId: string,
    client: any,
    adminClient: any
) {
    const text = event.message.text.trim()
    const lineUserId = event.source.userId
    const isGroupContext = event.source.type === 'group' || event.source.type === 'room'

    console.log('[LINE +1] Received text message:', { text, lineUserId, sourceType: event.source.type })

    // Check tenant settings for group ordering
    const { data: tenant } = await adminClient
        .from('tenants')
        .select('settings, slug')
        .eq('id', tenantId)
        .single()

    const settings = (tenant?.settings as Record<string, any>) || {}
    const groupOrderingEnabled = settings.line?.group_ordering_enabled || false

    console.log('[LINE +1] Group ordering enabled:', groupOrderingEnabled, 'Source type:', event.source.type)

    // If in group, only process when group ordering is enabled
    // If in 1-on-1 chat (user source), always allow ordering
    if (isGroupContext && !groupOrderingEnabled) {
        console.log('[LINE +1] SKIP: Group ordering is disabled')
        return
    }

    // Parse "+1" pattern: productId+quantity or productId *quantity
    // Supports formats: p000001+1, P000001+2, p000001*3, p000001 +1
    const match = text.match(/^(p\d{4,})\s*[+*×x]\s*(\d+)$/i)
    if (!match) {
        console.log('[LINE +1] SKIP: Regex did not match text:', text)
        return
    }

    const productId = match[1].toUpperCase()  // normalize to uppercase (DB stores as P000001)
    const quantity = parseInt(match[2], 10)

    console.log('[LINE +1] Parsed:', { productId, quantity })

    if (quantity <= 0 || quantity > 99) return

    // Find product by SKU (product IDs are like P000001)
    const { data: product, error: productError } = await adminClient
        .from('products')
        .select('id, name, price, options, image_url, stock, sku')
        .eq('tenant_id', tenantId)
        .eq('sku', productId)
        .eq('status', 'active')
        .single()

    console.log('[LINE +1] Product lookup:', { productId, tenantId, found: !!product, error: productError?.message })

    if (!product) {
        // Don't reply for invalid IDs to avoid spam
        return
    }

    // Auto-register or find existing customer (Shadow Account pattern)
    const customer = await getOrCreateCustomer(adminClient, client, tenantId, lineUserId)

    if (!customer) {
        // Always push error messages privately to the user
        await client.pushMessage({
            to: lineUserId,
            messages: [{
                type: 'text',
                text: `❌ 系統錯誤，無法處理您的訂單。請稍後再試。`
            }]
        })
        return
    }

    // Check if product has variants
    const hasVariants = product.options &&
        Array.isArray(product.options) &&
        (product.options as any[]).length > 0

    if (hasVariants) {
        // Send variant selector as private message to user
        await sendVariantSelector(client, lineUserId, product, quantity, customer.id)
    } else {
        // Simple product - add directly to cart
        await addToCart(adminClient, tenantId, customer.id, product.id, null, quantity)

        // Generate Magic Link for one-click checkout
        const magicToken = await generateMagicLinkToken(customer.authUserId, tenantId)
        const magicUrl = buildMagicLinkUrl(magicToken)
        const totalPrice = product.price * quantity

        const flexMessage = buildCheckoutFlexMessage(
            product,
            quantity,
            null,
            totalPrice,
            magicUrl,
            customer.isNew
        )

        // Always send as private message (DM) to the customer
        await client.pushMessage({
            to: lineUserId,
            messages: [flexMessage],
        })
    }
}

/**
 * Handle postback (e.g., variant selection from Flex Message)
 */
async function handlePostback(
    event: any,
    tenantId: string,
    client: any,
    adminClient: any
) {
    const data = new URLSearchParams(event.postback.data)
    const action = data.get('action')

    if (action === 'add_to_cart') {
        const productId = data.get('product_id')
        const variant = data.get('variant')
        const quantity = parseInt(data.get('quantity') || '1', 10)
        const lineUserId = event.source.userId

        // Auto-register or find existing customer
        const customer = await getOrCreateCustomer(adminClient, client, tenantId, lineUserId)

        if (!customer || !productId) return

        const { data: product } = await adminClient
            .from('products')
            .select('name, price, image_url')
            .eq('id', productId)
            .single()

        if (!product) return

        await addToCart(adminClient, tenantId, customer.id, productId, variant, quantity)

        // Generate Magic Link for one-click checkout
        const magicToken = await generateMagicLinkToken(customer.authUserId, tenantId)
        const magicUrl = buildMagicLinkUrl(magicToken)
        const totalPrice = product.price * quantity

        const flexMessage = buildCheckoutFlexMessage(
            product,
            quantity,
            variant || null,
            totalPrice,
            magicUrl,
            customer.isNew
        )

        // Always send as private message (DM) to the customer
        await client.pushMessage({
            to: lineUserId,
            messages: [flexMessage],
        })
    }
}

// ============================================================
// Helper Functions
// ============================================================

async function sendVariantSelector(
    client: any,
    lineUserId: string,
    product: any,
    quantity: number,
    customerId: string
) {
    const options = product.options as any[]
    // LINE carousel supports max 12 bubbles, each with max ~10 buttons
    const MAX_BUTTONS_PER_BUBBLE = 10
    const MAX_BUBBLES = 12
    const limitedOptions = options.slice(0, MAX_BUTTONS_PER_BUBBLE * MAX_BUBBLES)

    // Split options into chunks
    const chunks: any[][] = []
    for (let i = 0; i < limitedOptions.length; i += MAX_BUTTONS_PER_BUBBLE) {
        chunks.push(limitedOptions.slice(i, i + MAX_BUTTONS_PER_BUBBLE))
    }

    const totalPages = chunks.length

    // Build a bubble for each chunk
    const bubbles = chunks.map((chunk, pageIndex) => {
        const buttons = chunk.map((option: any) => {
            const label = typeof option === 'string' ? option : option.name || option.label || JSON.stringify(option)
            return {
                type: 'button',
                style: 'primary',
                color: '#1a1a1a',
                action: {
                    type: 'postback',
                    label: label.substring(0, 20),
                    data: `action=add_to_cart&product_id=${product.id}&variant=${encodeURIComponent(label)}&quantity=${quantity}`,
                }
            }
        })

        const bodyContents: any[] = [
            {
                type: 'text',
                text: product.name,
                weight: 'bold',
                size: 'lg',
            },
            {
                type: 'text',
                text: `NT$${product.price} × ${quantity}`,
                size: 'sm',
                color: '#888888',
            },
            {
                type: 'text',
                text: totalPages > 1
                    ? `請選擇規格（${pageIndex + 1}/${totalPages}）：`
                    : '請選擇規格：',
                size: 'sm',
                margin: 'md',
            },
        ]

        const bubble: any = {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                spacing: 'md',
                contents: bodyContents,
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                contents: buttons,
            },
        }

        // Only show hero image on first bubble
        if (pageIndex === 0 && product.image_url) {
            bubble.hero = {
                type: 'image',
                url: product.image_url,
                size: 'full',
                aspectRatio: '4:3',
                aspectMode: 'cover',
            }
        }

        return bubble
    })

    const flexMessage = {
        type: 'flex',
        altText: `選擇 ${product.name} 的規格`,
        contents: totalPages > 1
            ? { type: 'carousel', contents: bubbles }
            : bubbles[0],
    }

    // Send as private message (DM) to the customer
    await client.pushMessage({
        to: lineUserId,
        messages: [flexMessage],
    })
}

async function addToCart(
    adminClient: any,
    tenantId: string,
    customerId: string,
    productId: string,
    variant: string | null,
    quantity: number
) {
    // Check if item already in cart
    let query = adminClient
        .from('cart_items')
        .select('id, quantity')
        .eq('tenant_id', tenantId)
        .eq('customer_id', customerId)
        .eq('product_id', productId)

    if (variant) {
        query = query.eq('variant', variant)
    } else {
        query = query.is('variant', null)
    }

    const { data: existing } = await query.single()

    if (existing) {
        // Update quantity
        await adminClient
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('id', existing.id)
    } else {
        // Insert new item
        await adminClient
            .from('cart_items')
            .insert({
                tenant_id: tenantId,
                customer_id: customerId,
                product_id: productId,
                variant,
                quantity,
            })
    }
}
