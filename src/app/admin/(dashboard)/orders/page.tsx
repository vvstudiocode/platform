import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Eye, Search, Filter } from 'lucide-react'
import { OrderTable } from '@/components/admin/order-table'
import { OrderFormModal } from '@/components/admin/order-form-modal'
import { SearchInput } from '@/components/ui/search-input'

// 取得總部商店
async function getHQStore(supabase: any, userId: string) {
    const { data } = await supabase
        .from('tenants')
        .select('id, settings')
        .or(`slug.eq.hq,managed_by.eq.${userId}`)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    return data
}

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; q?: string }>
}) {
    const { status: statusFilter, q: searchQuery } = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const hqStore = await getHQStore(supabase, user.id)

    if (!hqStore) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-foreground">訂單管理</h1>
                <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
                    <p>尚未建立總部商店</p>
                </div>
            </div>
        )
    }

    let query = supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', hqStore.id)
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

    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, stock, images')
        .eq('tenant_id', hqStore.id)
        .order('name')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SearchInput placeholder="搜尋訂單編號、客戶名稱..." className="w-full max-w-sm" />
                <div className="flex items-center gap-3">
                    {/* Status Tabs/Filters could be here or below. Existing UI has them below. Let's keep them and maybe add the "Add Order" button here better. */}
                    <OrderFormModal
                        storeId={hqStore.id}
                        storeSlug="hq"
                        products={products?.map(p => ({
                            ...p,
                            stock: p.stock || 0,
                            images: (p.images as unknown as string[]) || []
                        })) || []}
                        settings={hqStore.settings}
                    />
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map((filter) => (
                    <Link
                        key={filter.value}
                        href={`/admin/orders?${new URLSearchParams({
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
                orders={orders as any || []}
                products={products?.map(p => ({
                    ...p,
                    stock: p.stock || 0,
                    images: (p.images as unknown as string[]) || []
                })) || []}
                isHQ={true}
                settings={hqStore.settings}
            />
        </div>
    )
}
