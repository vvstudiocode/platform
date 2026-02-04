import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Eye, Search, Filter } from 'lucide-react'
import { OrderTable } from '@/components/admin/order-table'
import { OrderFormModal } from '@/components/admin/order-form-modal'

// 取得總部商店 ID
async function getHQStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('tenants')
        .select('id')
        .or(`slug.eq.hq,managed_by.eq.${userId}`)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    return data?.id
}

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const { status: statusFilter } = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const hqStoreId = await getHQStoreId(supabase, user.id)

    if (!hqStoreId) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white">訂單管理</h1>
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">尚未建立總部商店</p>
                </div>
            </div>
        )
    }

    let query = supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', hqStoreId)
        .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    const { data: orders } = await query

    const statusLabels: Record<string, string> = {
        pending: '待付款',
        paid: '已付款',
        processing: '處理中',
        shipped: '已出貨',
        completed: '已完成',
        cancelled: '已取消',
    }

    const statusColors: Record<string, string> = {
        pending: 'bg-amber-500/20 text-amber-400',
        paid: 'bg-emerald-500/20 text-emerald-400',
        processing: 'bg-blue-500/20 text-blue-400',
        shipped: 'bg-purple-500/20 text-purple-400',
        completed: 'bg-green-500/20 text-green-400',
        cancelled: 'bg-red-500/20 text-red-400',
    }

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
        .select('id, name, price, stock')
        .eq('tenant_id', hqStoreId)
        .order('name')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">訂單管理</h1>
                <OrderFormModal
                    storeId={hqStoreId}
                    storeSlug="hq"
                    products={products || []}
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map((filter) => (
                    <Link
                        key={filter.value}
                        href={`/admin/orders${filter.value === 'all' ? '' : `?status=${filter.value}`}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${(statusFilter || 'all') === filter.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                    >
                        {filter.label}
                    </Link>
                ))}
            </div>

            <OrderTable
                orders={orders || []}
                products={products || []}
                isHQ={true}
            />
        </div>
    )
}
