import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// ============================================================
// LINE Cart Hydration API
// Returns cart items from DB for a logged-in LINE user
// Used by the cart hydration page to populate localStorage
// ============================================================

export const dynamic = 'force-dynamic'

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

export async function GET(request: NextRequest) {
    const tenantId = request.nextUrl.searchParams.get('tenant_id')
    if (!tenantId) {
        return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 })
    }

    // Get current user from session
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const adminClient = getAdminClient()

    // Find customer record
    const { data: customer } = await adminClient
        .from('customers')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('auth_user_id', user.id)
        .single()

    if (!customer) {
        return NextResponse.json({ items: [] })
    }

    // Get cart items with product details
    const { data: cartItems, error } = await adminClient
        .from('cart_items')
        .select(`
            id,
            product_id,
            variant,
            quantity,
            products (
                id,
                name,
                price,
                image_url,
                stock,
                sku,
                options
            )
        `)
        .eq('tenant_id', tenantId)
        .eq('customer_id', customer.id)

    if (error) {
        console.error('[Cart API] Error fetching cart items:', error)
        return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
    }

    // Transform to match CartItem interface from cart-context
    const items = (cartItems || [])
        .filter((item: any) => item.products) // skip if product was deleted
        .map((item: any) => {
            const product = item.products
            return {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image_url || undefined,
                maxStock: product.stock || 999,
                sku: product.sku || undefined,
                options: item.variant ? { variant: item.variant } : undefined,
            }
        })

    return NextResponse.json({ items, customerId: customer.id })
}
