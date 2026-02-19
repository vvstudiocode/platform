import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// ============================================================
// Cart Synchronization API
// Syncs client-side cart items to the database
// = { items: CartItem[], mode: 'replace' | 'merge' }
// ============================================================

export const dynamic = 'force-dynamic'

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

export async function POST(request: NextRequest) {
    try {
        const tenantId = request.nextUrl.searchParams.get('tenant_id')
        if (!tenantId) {
            return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 })
        }

        const body = await request.json()
        const { items, mode = 'replace' } = body

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid items format' }, { status: 400 })
        }

        // 1. Authenticate user
        let userId: string | null = null

        // Try standard session first
        try {
            const supabase = await createServerClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.id) userId = user.id
        } catch (e) { }

        // Fallback to user_id param (from magic links/LINE)
        if (!userId) {
            const userIdParam = request.nextUrl.searchParams.get('user_id')
            if (userIdParam) {
                const adminClient = getAdminClient()
                const { data: verifiedUser } = await adminClient.auth.admin.getUserById(userIdParam)
                if (verifiedUser?.user) userId = verifiedUser.user.id
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const adminClient = getAdminClient()

        // 2. Get Customer ID
        const { data: customer, error: customerError } = await adminClient
            .from('customers')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('auth_user_id', userId)
            .single()

        if (customerError || !customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        // 3. Sync Logic
        if (mode === 'replace') {
            // Delete all existing and insert new
            await adminClient
                .from('cart_items')
                .delete()
                .eq('tenant_id', tenantId)
                .eq('customer_id', customer.id)

            if (items.length > 0) {
                const toInsert = items.map(item => ({
                    tenant_id: tenantId,
                    customer_id: customer.id,
                    product_id: item.productId,
                    variant: item.options?.variant || null,
                    quantity: item.quantity
                }))
                await adminClient.from('cart_items').insert(toInsert)
            }
        } else {
            // Merge mode (used for initial link)
            for (const item of items) {
                // Check if exists
                let q = adminClient
                    .from('cart_items')
                    .select('id, quantity')
                    .eq('tenant_id', tenantId)
                    .eq('customer_id', customer.id)
                    .eq('product_id', item.productId)

                if (item.options?.variant) {
                    q = q.eq('variant', item.options.variant)
                } else {
                    q = q.is('variant', null)
                }

                const { data: existing } = await q.maybeSingle()

                if (existing) {
                    // Update quantity (max check could be here but usually handled by client)
                    await adminClient
                        .from('cart_items')
                        .update({ quantity: existing.quantity + item.quantity })
                        .eq('id', existing.id)
                } else {
                    // Insert
                    await adminClient.from('cart_items').insert({
                        tenant_id: tenantId,
                        customer_id: customer.id,
                        product_id: item.productId,
                        variant: item.options?.variant || null,
                        quantity: item.quantity
                    })
                }
            }
        }

        return NextResponse.json({ success: true })

    } catch (err: any) {
        console.error('[Cart Sync API] Error:', err)
        return NextResponse.json({ error: 'Internal Error', details: err.message }, { status: 500 })
    }
}
