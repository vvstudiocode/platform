import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Eye, Search, Filter } from 'lucide-react'

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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">訂單管理</h1>

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

            {/* Table */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">訂單編號</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">客戶</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">金額</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">狀態</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">日期</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders && orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-white">{order.order_number}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-white">{order.customer_name}</p>
                                        <p className="text-sm text-zinc-500">{order.customer_phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white font-medium">NT$ {Number(order.total).toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                            {statusLabels[order.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-zinc-400">
                                            {new Date(order.created_at).toLocaleDateString('zh-TW')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                    尚無訂單
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
