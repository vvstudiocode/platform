import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// ============================================================
// LINE Cart Hydration API
// Returns cart items from DB for a LINE user
// Supports multiple auth methods:
//   1. Supabase session (cookie)
//   2. user_id query param (from JWT-verified magic link redirect)
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
    const traceId = request.nextUrl.searchParams.get('trace_id') || `get-${Math.random().toString(36).substring(2, 9)}`
    try {
        const tenantId = request.nextUrl.searchParams.get('tenant_id')
        if (!tenantId) {
            return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 })
        }

        console.log(`[Cart API] [${traceId}] GET request received for tenant: ${tenantId}`)

        // Try to get user ID from multiple sources
        let userId: string | null = null

        // Method 1: Supabase session (standard cookie auth)
        try {
            const supabase = await createServerClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.id) {
                userId = user.id
                console.log(`[Cart API] [${traceId}] Auth via session cookie: ${userId}`)
            }
        } catch (e) {
            console.log(`[Cart API] [${traceId}] Session auth failed, trying fallback`)
        }

        // Method 2: user_id from magic-login redirect (already JWT-verified)
        if (!userId) {
            const userIdParam = request.nextUrl.searchParams.get('user_id')
            if (userIdParam) {
                const adminClient = getAdminClient()
                const { data: verifiedUser } = await adminClient.auth.admin.getUserById(userIdParam)
                if (verifiedUser?.user) {
                    userId = verifiedUser.user.id
                    console.log(`[Cart API] [${traceId}] Auth via user_id param: ${userId}`)
                }
            }
        }

        if (!userId) {
            console.error(`[Cart API] [${traceId}] No authenticated user found`)
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const adminClient = getAdminClient()

        // Find customer record
        const { data: customer, error: customerError } = await adminClient
            .from('customers')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('auth_user_id', userId)
            .single()

        if (customerError) {
            // If no row found, it's fine, return empty cart
            if (customerError.code === 'PGRST116') {
                console.log(`[Cart API] [${traceId}] Customer not found for authUserId: ${userId}, returning empty cart`)
                return NextResponse.json({ items: [] })
            }
            // Real DB error
            console.error(`[Cart API] [${traceId}] Error fetching customer:`, customerError)
            return NextResponse.json({
                error: 'Failed to fetch customer',
                details: customerError.message,
                code: customerError.code,
                trace_id: traceId
            }, { status: 500 })
        }

        if (!customer) {
            console.log(`[Cart API] [${traceId}] No customer record found`)
            return NextResponse.json({ items: [] })
        }

        console.log(`[Cart API] [${traceId}] Found customer: ${customer.id}`)

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
            console.error(`[Cart API] [${traceId}] Error fetching cart items:`, error)
            return NextResponse.json({
                error: 'Failed to fetch cart',
                details: error.message,
                code: error.code,
                trace_id: traceId
            }, { status: 500 })
        }

        console.log(`[Cart API] [${traceId}] Raw cart items count: ${cartItems?.length || 0}`)

        // Transform to match CartItem interface from cart-context
        const items = (cartItems || [])
            .filter((item: any) => item.products) // skip if product was deleted
            .map((item: any) => {
                const product = item.products
                return {
                    id: item.id, // Include cart item ID
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

        console.log(`[Cart API] [${traceId}] Successfully transformed ${items.length} items`)
        return NextResponse.json({ items, customerId: customer.id, trace_id: traceId })

    } catch (err: any) {
        console.error(`[Cart API] [${traceId}] Unexpected error:`, err)
        return NextResponse.json({
            error: 'Internal Server Error',
            details: err.message,
            trace_id: traceId
        }, { status: 500 })
    }
}

