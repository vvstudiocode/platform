import { NextRequest, NextResponse } from 'next/server'
import { getLineCredentials, getLineClient, verifySignature } from '@/lib/line/client'
import { createClient } from '@supabase/supabase-js'

// ============================================================
// LINE Webhook Handler
// Receives events from LINE platform and dispatches them
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
 */
async function handleTextMessage(
    event: any,
    tenantId: string,
    client: any,
    adminClient: any
) {
    const text = event.message.text.trim()
    const lineUserId = event.source.userId

    console.log('[LINE +1] Received text message:', { text, lineUserId, sourceType: event.source.type })

    // Check tenant settings for group ordering
    const { data: tenant } = await adminClient
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single()

    const settings = (tenant?.settings as Record<string, any>) || {}
    const groupOrderingEnabled = settings.line?.group_ordering_enabled || false

    console.log('[LINE +1] Group ordering enabled:', groupOrderingEnabled, 'Source type:', event.source.type)

    // Only process +1 in group context and if enabled
    if (!groupOrderingEnabled) {
        console.log('[LINE +1] SKIP: Group ordering is disabled')
        return
    }
    if (event.source.type !== 'group' && event.source.type !== 'room') {
        console.log('[LINE +1] SKIP: Not in group/room, source type:', event.source.type)
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

    // Find product by ID (product IDs are like P000001)
    const { data: product, error: productError } = await adminClient
        .from('products')
        .select('id, name, price, options, image_url, stock')
        .eq('tenant_id', tenantId)
        .eq('id', productId)
        .eq('status', 'active')
        .single()

    console.log('[LINE +1] Product lookup:', { productId, tenantId, found: !!product, error: productError?.message })

    if (!product) {
        // Don't reply for invalid IDs to avoid spam
        return
    }

    // Check if user is bound
    const { data: customer } = await adminClient
        .from('customers')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .eq('line_user_id', lineUserId)
        .single()

    if (!customer) {
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{
                type: 'text',
                text: `⚠️ 您尚未綁定會員帳號，請先點擊選單中的「綁定會員」完成綁定後再下單。`
            }]
        })
        return
    }

    // Check if product has variants
    const hasVariants = product.options &&
        Array.isArray(product.options) &&
        (product.options as any[]).length > 0

    if (hasVariants) {
        // Send Flex Message for variant selection
        await sendVariantSelector(client, event.replyToken, product, quantity, customer.id)
    } else {
        // Simple product - add directly to cart
        await addToCart(adminClient, tenantId, customer.id, product.id, null, quantity)
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{
                type: 'text',
                text: `✅ 已將 ${product.name} x${quantity} 加入購物車！\n💰 小計：NT$${product.price * quantity}`
            }]
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

        const { data: customer } = await adminClient
            .from('customers')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('line_user_id', lineUserId)
            .single()

        if (!customer || !productId) return

        const { data: product } = await adminClient
            .from('products')
            .select('name, price')
            .eq('id', productId)
            .single()

        if (!product) return

        await addToCart(adminClient, tenantId, customer.id, productId, variant, quantity)

        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{
                type: 'text',
                text: `✅ 已將 ${product.name}${variant ? ` (${variant})` : ''} x${quantity} 加入購物車！\n💰 小計：NT$${product.price * quantity}`
            }]
        })
    }
}

// ============================================================
// Helper Functions
// ============================================================

async function sendVariantSelector(
    client: any,
    replyToken: string,
    product: any,
    quantity: number,
    customerId: string
) {
    const options = product.options as any[]
    // Build Flex Message buttons for each variant
    const buttons = options.slice(0, 10).map((option: any) => {
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

    const flexMessage = {
        type: 'flex',
        altText: `選擇 ${product.name} 的規格`,
        contents: {
            type: 'bubble',
            hero: product.image_url ? {
                type: 'image',
                url: product.image_url,
                size: 'full',
                aspectRatio: '4:3',
                aspectMode: 'cover',
            } : undefined,
            body: {
                type: 'box',
                layout: 'vertical',
                spacing: 'md',
                contents: [
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
                        text: '請選擇規格：',
                        size: 'sm',
                        margin: 'md',
                    },
                ]
            },
            footer: {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                contents: buttons,
            },
        }
    }

    await client.replyMessage({
        replyToken,
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
