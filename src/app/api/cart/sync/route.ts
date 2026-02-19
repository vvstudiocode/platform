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
    const traceId = request.nextUrl.searchParams.get('trace_id') || `sync-${Math.random().toString(36).substring(2, 9)}`
    try {
        const tenantId = request.nextUrl.searchParams.get('tenant_id')
        if (!tenantId) {
            return NextResponse.json({ error: 'Missing tenant_id' }, { status: 400 })
        }

        const body = await request.json()
        const { items, mode = 'replace' } = body

        console.log(`[Cart Sync] [${traceId}] POST request received. Mode: ${mode}, Items: ${items?.length}, Tenant: ${tenantId}`)

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid items format' }, { status: 400 })
        }

        // 1. Authenticate user
        let userId: string | null = null

        // Try standard session first
        try {
            const supabase = await createServerClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.id) {
                userId = user.id
                console.log(`[Cart Sync] [${traceId}] Auth via session: ${userId}`)
            }
        } catch (e) { }

        // Fallback to user_id param (from magic links/LINE)
        if (!userId) {
            const userIdParam = request.nextUrl.searchParams.get('user_id')
            if (userIdParam) {
                const adminClient = getAdminClient()
                const { data: verifiedUser } = await adminClient.auth.admin.getUserById(userIdParam)
                if (verifiedUser?.user) {
                    userId = verifiedUser.user.id
                    console.log(`[Cart Sync] [${traceId}] Auth via user_id param: ${userId}`)
                }
            }
        }

        if (!userId) {
            console.warn(`[Cart Sync] [${traceId}] Not authenticated`)
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
            console.error(`[Cart Sync] [${traceId}] Customer not found for authUserId: ${userId}, tenant: ${tenantId}`)
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        console.log(`[Cart Sync] [${traceId}] Resolved customer: ${customer.id}`)

        // 3. Sync Logic
        if (mode === 'replace') {
            // Delete all existing and insert new
            const { count: deletedRows, error: deleteError } = await adminClient
                .from('cart_items')
                .delete({ count: 'exact' })
                .eq('tenant_id', tenantId)
                .eq('customer_id', customer.id)

            if (deleteError) {
                console.error(`[Cart Sync] [${traceId}] Delete failed:`, deleteError)
                throw deleteError
            }

            console.log(`[Cart Sync] [${traceId}] Deleted ${deletedRows || 0} existing rows`)

            let insertedRows = 0
            if (items.length > 0) {
                const toInsert = items.map(item => ({
                    tenant_id: tenantId,
                    customer_id: customer.id,
                    product_id: item.productId,
                    variant: item.options?.variant || null,
                    quantity: item.quantity
                }))
                const { error: insertError } = await adminClient.from('cart_items').insert(toInsert)
                if (insertError) {
                    console.error(`[Cart Sync] [${traceId}] Insert failed:`, insertError)
                    throw insertError
                }
                insertedRows = toInsert.length
            }
            console.log(`[Cart Sync] [${traceId}] Inserted ${insertedRows} new rows. Final items count in payload: ${items.length}`)
        } else {
            // Merge mode (used for initial link)
            console.log(`[Cart Sync] [${traceId}] Performing merge for ${items.length} items`)
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

        return NextResponse.json({ success: true, trace_id: traceId })

    } catch (err: any) {
        console.error(`[Cart Sync] [${traceId}] Unexpected error:`, err)
        return NextResponse.json({ error: 'Internal Error', details: err.message, trace_id: traceId }, { status: 500 })
    }
}

