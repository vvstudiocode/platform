import { createClient } from '@/lib/supabase/server'
import { getDateRangeFromParams } from '@/lib/dashboard-utils'
import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'

export async function GET(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'orders'
    const { from, to } = getDateRangeFromParams(searchParams)

    // Identify user role and managed stores
    // HQ User: Show all managed stores data
    // Store User: Show only their store data

    // Determine scope
    let tenantIds: string[] = []

    // Check if user is HQ admin (manages tenants)
    const { data: managedTenants } = await supabase
        .from('tenants')
        .select('id')
        .eq('managed_by', user.id)

    if (managedTenants && managedTenants.length > 0) {
        tenantIds = managedTenants.map(t => t.id)
    } else {
        // Check if user fits into a specific tenant role
        const { data: userRole } = await supabase
            .from('users_roles')
            .select('tenant_id')
            .eq('user_id', user.id)
            .single()

        if (userRole?.tenant_id) {
            tenantIds = [userRole.tenant_id]
        }
    }

    if (tenantIds.length === 0) {
        // Fallback: If no implicit tenant association found, try filtering by query param if provided?
        // But for security, we restrict to what user can access.
        // If really nothing, return empty.
        return new NextResponse('No access to any store data', { status: 403 })
    }

    let csvContent = ''

    try {
        if (type === 'orders') {
            const { data: orders } = await supabase
                .from('orders')
                .select(`
                    id,
                    created_at,
                    status,
                    total_amount,
                    shipping_fee,
                    customer_info,
                    tenant_id,
                    items
                `)
                .in('tenant_id', tenantIds)
                .gte('created_at', from.toISOString())
                .lte('created_at', to.toISOString())
                .order('created_at', { ascending: false })

            // CSV Header
            csvContent = '\uFEFFOrders Report\n' // BOM for Excel
            csvContent += 'Order ID,Date,Store ID,Status,Customer Name,Total Amount,Shipping Fee,Items Count\n'

            // Safe cast to avoid strict type inference issues with JSON columns
            const safeOrders = (orders || []) as any[]

            safeOrders.forEach(order => {
                const date = order.created_at ? format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss') : ''
                const customerName = order.customer_info?.name || 'Guest'
                const itemsCount = Array.isArray(order.items) ? order.items.length : 0

                // Escape logic for CSV
                const safeName = `"${String(customerName).replace(/"/g, '""')}"`

                csvContent += `${order.id},${date},${order.tenant_id},${order.status},${safeName},${order.total_amount},${order.shipping_fee},${itemsCount}\n`
            })

        } else if (type === 'products') {
            // Aggregate product sales
            // This requires fetching orders and aggregating items
            const { data: orders } = await supabase
                .from('orders')
                .select('items, tenant_id')
                .in('tenant_id', tenantIds)
                .gte('created_at', from.toISOString())
                .lte('created_at', to.toISOString())
                .neq('status', 'cancelled')

            const productStats = new Map<string, { revenue: number, count: number, name: string }>()

            // Need product names
            const { data: products } = await supabase
                .from('products')
                .select('id, name')
                .in('tenant_id', tenantIds)

            const productNameMap = new Map(products?.map(p => [p.id, p.name]))

            // Safe cast for consistency
            const safeOrders = (orders || []) as any[]

            safeOrders.forEach(order => {
                const items = Array.isArray(order.items) ? order.items : []
                items.forEach((item: any) => {
                    const pid = item.product_id
                    const qty = Number(item.quantity || 0)
                    const price = Number(item.price || item.unit_price || 0)
                    const revenue = qty * price

                    const current = productStats.get(pid) || { revenue: 0, count: 0, name: productNameMap.get(pid) || 'Unknown' }
                    productStats.set(pid, {
                        revenue: current.revenue + revenue,
                        count: current.count + qty,
                        name: current.name
                    })
                })
            })

            csvContent = '\uFEFFProduct Sales Report\n'
            csvContent += 'Product Name,Quantity Sold,Total Revenue\n'

            Array.from(productStats.values())
                .sort((a, b) => b.revenue - a.revenue)
                .forEach(stat => {
                    csvContent += `"${String(stat.name).replace(/"/g, '""')}",${stat.count},${stat.revenue}\n`
                })
        }

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${type}_report.csv"`,
            },
        })

    } catch (error) {
        console.error('Export API Error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
