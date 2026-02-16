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

function buildMagicLinkUrl(token: string, storeSlug: string | null = null): string {
    // Prefer SITE_URL (server-only, read at runtime even in standalone mode)
    // NEXT_PUBLIC_SITE_URL is inlined at build time, may be stale in standalone
    const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    const isDev = process.env.NODE_ENV === 'development'

    // If production and we have a store slug/root domain, create subdomain URL
    // e.g. https://demo.omoselect.shop/api/auth/...
    if (!isDev && storeSlug && rootDomain) {
        return `https://${storeSlug}.${rootDomain}/api/auth/line-magic-login?token=${token}`
    }

    console.log('[LINE Magic] Building magic link with siteUrl:', siteUrl)
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
    const dmOrderingEnabled = settings.line?.dm_ordering_enabled || false

    console.log('[LINE +1] Settings:', { groupOrderingEnabled, dmOrderingEnabled }, 'Source type:', event.source.type)

    // Check permissions based on context
    if (isGroupContext) {
        if (!groupOrderingEnabled) {
            console.log('[LINE +1] SKIP: Group ordering is disabled')
            return
        }
    } else {
        // 1-on-1 Chat
        if (!dmOrderingEnabled) {
            console.log('[LINE +1] SKIP: DM ordering is disabled')
            return
        }
    }

    // ── Login / Member / Order keywords ──
    const loginKeywords = ['登入', 'login', '會員', 'member', '查詢', '查訂單', '訂單', '我的帳戶', 'account']
    const textLower = text.toLowerCase()
    if (loginKeywords.some(kw => textLower === kw)) {
        await handleLoginRequest(event, tenantId, tenant?.slug || 'omo', client, adminClient)
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
        // Reply with error
        await client.replyMessage({
            replyToken: event.replyToken,
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
        // Send variant selector
        await sendVariantSelector(client, event.replyToken, product, quantity)
    } else {
        // Simple product - add directly to cart
        await addToCart(adminClient, tenantId, customer.id, product.id, null, quantity)

        // Generate Magic Link for one-click checkout
        const magicToken = await generateMagicLinkToken(customer.authUserId, tenantId)
        const magicUrl = buildMagicLinkUrl(magicToken, tenant?.slug) // Pass slug
        const totalPrice = product.price * quantity

        const flexMessage = buildCheckoutFlexMessage(
            product,
            quantity,
            null,
            totalPrice,
            magicUrl,
            customer.isNew
        )

        // Reply with Flex Message
        await client.replyMessage({
            replyToken: event.replyToken,
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

        // Fetch product and tenant slug
        const { data: product } = await adminClient
            .from('products')
            .select('name, price, image_url, tenant_id') // added tenant_id check? no need
            .eq('id', productId)
            .single()

        // Fetch tenant slug for URL
        const { data: tenant } = await adminClient
            .from('tenants')
            .select('slug')
            .eq('id', tenantId)
            .single()

        if (!product) return

        await addToCart(adminClient, tenantId, customer.id, productId, variant, quantity)

        // Generate Magic Link for one-click checkout
        const magicToken = await generateMagicLinkToken(customer.authUserId, tenantId)
        const magicUrl = buildMagicLinkUrl(magicToken, tenant?.slug)
        const totalPrice = product.price * quantity

        const flexMessage = buildCheckoutFlexMessage(
            product,
            quantity,
            variant || null,
            totalPrice,
            magicUrl,
            customer.isNew
        )

        // Reply with Flex Message
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [flexMessage],
        })
    }
}

// ============================================================
// Helper Functions
// ============================================================

// Helper to generate cartesian product of option values
function generateCombinations(options: any[]): string[] {
    if (!options || options.length === 0) return []

    // 1. Identify structure: Are options "flat strings" or "groups with values"?
    const isGrouped = options.some(opt => typeof opt === 'object' && opt.values && Array.isArray(opt.values))

    if (!isGrouped) {
        // Flat list of variants (legacy or simple)
        // e.g. ["Red", "Blue", "S", "M"] -> just return as is?
        // Or if it's mixed strings and objects without values?
        return options.map(opt => typeof opt === 'string' ? opt : opt.name || JSON.stringify(opt))
    }

    // 2. It's grouped options (e.g. Color, Size)
    // We need to generate all combinations: [Color:Red, Size:S], [Color:Red, Size:M]...
    // Input: [{ name: 'Color', values: ['Red', 'Blue'] }, { name: 'Size', values: ['S', 'M'] }]
    // Output: ["Red / S", "Red / M", "Blue / S", "Blue / M"]

    const groups = options.filter(opt => opt.values && Array.isArray(opt.values) && opt.values.length > 0)

    if (groups.length === 0) return []

    // Recursive generator
    const combine = (current: string[], index: number): string[][] => {
        if (index === groups.length) return [current]

        const group = groups[index]
        const res: string[][] = []

        for (const value of group.values) {
            const next = [...current, value]
            res.push(...combine(next, index + 1))
        }
        return res
    }

    // Flatten to "Value / Value" strings
    // Or include group names? e.g. "Color: Red / Size: S"?
    // Typically shorter is better for buttons: "Red / S"
    const combinations = combine([], 0)
    return combinations.map(combo => combo.join(' / ')) // Separator can be customised
}

async function sendVariantSelector(
    client: any,
    replyToken: string,
    product: any,
    quantity: number
) {
    const options = product.options as any[]

    // Generate valid sellable variants (combinations)
    const variants = generateCombinations(options)

    if (variants.length === 0) {
        // Fallback or error? If options exist but no values?
        // Maybe allow adding base product?
        // For now, assume if options exist, variants must exist.
        return
    }

    // LINE carousel supports max 12 bubbles, each with max ~10 buttons (actually closer to 3-4 for good UX, limit is high but vertical space is issue)
    // We'll use 10 buttons per bubble
    const MAX_BUTTONS_PER_BUBBLE = 10
    const MAX_BUBBLES = 12
    const MAX_TOTAL_VARIANTS = MAX_BUTTONS_PER_BUBBLE * MAX_BUBBLES

    let limitedVariants = variants
    const totalCount = variants.length

    if (totalCount > MAX_TOTAL_VARIANTS) {
        limitedVariants = variants.slice(0, MAX_TOTAL_VARIANTS)
        // Warn? "Too many variants, please order on website"
        // We'll just show the first N and maybe add a "More on website" button later if needed
    }

    // Split into chunks for carousel bubbles
    const chunks: string[][] = []
    for (let i = 0; i < limitedVariants.length; i += MAX_BUTTONS_PER_BUBBLE) {
        chunks.push(limitedVariants.slice(i, i + MAX_BUTTONS_PER_BUBBLE))
    }

    const totalPages = chunks.length

    // Build a bubble for each chunk
    const bubbles = chunks.map((chunk, pageIndex) => {
        const buttons = chunk.map((variantLabel) => {
            return {
                type: 'button',
                style: 'secondary', // Use secondary for choices
                color: '#1a1a1a',
                height: 'sm',
                action: {
                    type: 'postback',
                    label: variantLabel.substring(0, 20), // Truncate label to fit
                    data: `action=add_to_cart&product_id=${product.id}&variant=${encodeURIComponent(variantLabel)}&quantity=${quantity}`,
                }
            }
        })

        const bodyContents: any[] = [
            {
                type: 'text',
                text: product.name,
                weight: 'bold',
                size: 'md', // Reduce size slightly
                wrap: true,
            },
            {
                type: 'text',
                text: `NT$${product.price} × ${quantity}`,
                size: 'sm',
                color: '#888888',
                margin: 'xs',
            },
            {
                type: 'text',
                text: totalPages > 1
                    ? `請選擇規格（${pageIndex + 1}/${totalPages}）：`
                    : '請選擇規格：',
                size: 'sm',
                margin: 'md',
                weight: 'bold',
                color: '#555555',
            },
        ]

        const bubble: any = {
            type: 'bubble',
            size: 'kilo', // make bubble smaller if possible, or use default 'mega'
            body: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                paddingAll: '16px',
                contents: bodyContents,
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                paddingAll: '16px',
                contents: buttons,
            },
        }

        // Only show hero image on first bubble to save data/space
        // AND only if total pages is small, otherwise scrolling back to see variants is annoying if image is huge
        if (pageIndex === 0 && product.image_url) {
            bubble.hero = {
                type: 'image',
                url: product.image_url,
                size: 'full',
                aspectRatio: '20:13',
                aspectMode: 'cover',
            }
        }

        return bubble
    })

    const flexMessage = {
        type: 'flex',
        altText: `請選擇 ${product.name} 的規格`,
        contents: totalPages > 1
            ? { type: 'carousel', contents: bubbles }
            : bubbles[0],
    }

    await client.replyMessage({
        replyToken: replyToken,
        messages: [flexMessage],
    })
}

/**
 * Handle login/member/query keyword requests
 * Generates a Magic Link and replies with a Flex Message to access Account page
 */
async function handleLoginRequest(
    event: any,
    tenantId: string,
    storeSlug: string,
    client: any,
    adminClient: any
) {
    const lineUserId = event.source.userId
    if (!lineUserId) return

    console.log('[LINE Login] Login request from:', lineUserId)

    // Get or create customer (shadow account)
    const customer = await getOrCreateCustomer(adminClient, client, tenantId, lineUserId)

    if (!customer) {
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{
                type: 'text',
                text: '❌ 系統錯誤，無法處理您的請求。請稍後再試。'
            }]
        })
        return
    }

    // Generate Magic Link pointing to account page
    const magicToken = await generateMagicLinkToken(customer.authUserId, tenantId)
    const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const magicUrl = `${siteUrl}/api/auth/line-magic-login?token=${magicToken}&redirect=account`

    console.log('[LINE Login] Magic link generated for customer:', customer.id)

    // Build Flex Message
    const flexMessage = {
        type: 'flex',
        altText: '👤 會員中心入口',
        contents: {
            type: 'bubble',
            body: {
                type: 'box',
                layout: 'vertical',
                spacing: 'md',
                paddingAll: '20px',
                contents: [
                    {
                        type: 'text',
                        text: '👤 會員中心',
                        weight: 'bold',
                        size: 'lg',
                        color: '#1a1a1a',
                    },
                    {
                        type: 'separator',
                        margin: 'md',
                    },
                    {
                        type: 'text',
                        text: `哈囉 ${customer.name}！`,
                        size: 'sm',
                        margin: 'md',
                        color: '#555555',
                    },
                    {
                        type: 'text',
                        text: '點擊下方按鈕即可進入您的會員中心，查看訂單或管理個人資料。',
                        size: 'sm',
                        wrap: true,
                        color: '#888888',
                        margin: 'sm',
                    },
                ],
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
                            label: '🔑 前往會員中心',
                            uri: magicUrl,
                        },
                    },
                ],
            },
        },
    }

    await client.replyMessage({
        replyToken: event.replyToken,
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
    console.log('[LINE +1] addToCart called:', { tenantId, customerId, productId, variant, quantity })

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

    const { data: existing, error: lookupError } = await query.single()

    if (lookupError && lookupError.code !== 'PGRST116') {
        console.error('[LINE +1] addToCart lookup error:', lookupError)
    }

    if (existing) {
        // Update quantity
        const newQty = existing.quantity + quantity
        console.log('[LINE +1] addToCart: updating existing item', existing.id, 'qty:', existing.quantity, '->', newQty)
        const { error: updateError } = await adminClient
            .from('cart_items')
            .update({ quantity: newQty })
            .eq('id', existing.id)

        if (updateError) {
            console.error('[LINE +1] addToCart UPDATE failed:', updateError)
        } else {
            console.log('[LINE +1] addToCart: update success')
        }
    } else {
        // Insert new item
        console.log('[LINE +1] addToCart: inserting new item')
        const { data: inserted, error: insertError } = await adminClient
            .from('cart_items')
            .insert({
                tenant_id: tenantId,
                customer_id: customerId,
                product_id: productId,
                variant,
                quantity,
            })
            .select('id')
            .single()

        if (insertError) {
            console.error('[LINE +1] addToCart INSERT failed:', insertError)
        } else {
            console.log('[LINE +1] addToCart: insert success, id:', inserted?.id)
        }
    }
}
