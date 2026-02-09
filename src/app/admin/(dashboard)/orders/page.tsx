import { redirect } from 'next/navigation'
import { getCurrentTenant } from '@/lib/tenant'
import { OrderListPage } from '@/features/orders/order-list-page'
import { createClient } from '@/lib/supabase/server'

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; q?: string }>
}) {
    const { status: statusFilter, q: searchQuery } = await searchParams

    // 使用統一的 Tenant 獲取邏輯
    const tenant = await getCurrentTenant('admin')

    if (!tenant) {
        redirect('/admin/login')
    }

    const supabase = await createClient()

    // 建立查詢
    let query = supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    if (searchQuery) {
        query = query.or(`order_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`)
    }

    const { data: orders } = await query

    // 獲取商品列表（用於新增訂單）
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, stock, images')
        .eq('tenant_id', tenant.id)
        .order('name')

    return (
        <OrderListPage
            orders={(orders as any[]) || []}
            products={products?.map(p => ({
                ...p,
                stock: p.stock || 0,
                images: (p.images as unknown as string[]) || []
            })) || []}
            storeId={tenant.id}
            storeSlug={tenant.slug}
            isHQ={true}
            settings={tenant.settings || {}}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            baseUrl="/admin/orders"
        />
    )
}
