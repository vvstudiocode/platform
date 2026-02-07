import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { OrderTable } from '@/components/admin/order-table'
import { OrderFormModal } from '@/components/admin/order-form-modal'
import { SearchInput } from '@/components/ui/search-input'

async function getUserStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id, tenants:tenant_id(slug, settings)')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return { storeId: data?.tenant_id, storeSlug: data?.tenants?.slug, settings: data?.tenants?.settings }
}

export default async function AppOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; q?: string }>
}) {
    const { status: statusFilter, q: searchQuery } = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/app/login')

    const { storeId, storeSlug, settings } = await getUserStoreId(supabase, user.id)
    if (!storeId) redirect('/app/onboarding')

    let query = supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', storeId)
        .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    if (searchQuery) {
        query = query.or(`order_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`)
    }

    const { data: orders } = await query

    const filters = [
        { value: 'all', label: '全部' },
        { value: 'pending', label: '待付款' },
        { value: 'paid', label: '已付款' },
        { value: 'processing', label: '處理中' },
        { value: 'shipped', label: '已出貨' },
        { value: 'completed', label: '已完成' },
    ]

    // Fetch products for order form modal
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, stock, images')
        .eq('tenant_id', storeId)
        .order('name')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SearchInput placeholder="搜尋訂單編號、客戶名稱..." className="w-full max-w-sm" />
                <OrderFormModal
                    storeId={storeId}
                    storeSlug={storeSlug || 'store'}
                    products={products?.map(p => ({
                        ...p,
                        stock: p.stock || 0,
                        images: (p.images as unknown as string[]) || []
                    })) || []}
                    settings={settings}
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map((filter) => (
                    <Link
                        key={filter.value}
                        href={`/app/orders?${new URLSearchParams({
                            ...(statusFilter ? { status: statusFilter } : {}),
                            ...(searchQuery ? { q: searchQuery } : {}),
                            status: filter.value
                        }).toString()}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${(statusFilter || 'all') === filter.value
                            ? 'bg-accent text-accent-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        {filter.label}
                    </Link>
                ))}
            </div>

            <OrderTable
                orders={(orders as any[]) || []}
                products={products?.map(p => ({
                    ...p,
                    stock: p.stock || 0,
                    images: (p.images as unknown as string[]) || []
                })) || []}
                storeId={storeId}
                isHQ={false}
                settings={settings}
            />
        </div>
    )
}
