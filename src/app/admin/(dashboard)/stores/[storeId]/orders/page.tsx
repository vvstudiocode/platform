import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, ClipboardList, Clock, CheckCircle, Truck, XCircle, DollarSign, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    params: Promise<{ storeId: string }>
    searchParams: Promise<{ status?: string }>
}

export default async function StoreOrdersPage({ params, searchParams }: Props) {
    const { storeId } = await params
    const { status } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 驗證商店所有權
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('id', storeId)
        .eq('managed_by', user?.id)
        .single()

    if (!store) {
        notFound()
    }

    // 取得訂單
    let query = supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', storeId)
        .order('created_at', { ascending: false })

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    const { data: orders } = await query

    const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
        pending: { icon: Clock, label: '待付款', color: 'text-amber-400 bg-amber-500/20' },
        paid: { icon: DollarSign, label: '已付款', color: 'text-emerald-400 bg-emerald-500/20' },
        processing: { icon: Package, label: '處理中', color: 'text-blue-400 bg-blue-500/20' },
        shipped: { icon: Truck, label: '已出貨', color: 'text-purple-400 bg-purple-500/20' },
        completed: { icon: CheckCircle, label: '已完成', color: 'text-green-400 bg-green-500/20' },
        cancelled: { icon: XCircle, label: '已取消', color: 'text-red-400 bg-red-500/20' },
    }

    const statusFilters = [
        { value: 'all', label: '全部' },
        { value: 'pending', label: '待付款' },
        { value: 'paid', label: '已付款' },
        { value: 'processing', label: '處理中' },
        { value: 'shipped', label: '已出貨' },
        { value: 'completed', label: '已完成' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href={`/admin/stores/${storeId}`}
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        返回 {store.name}
                    </Link>
                    <h1 className="text-2xl font-bold text-white">訂單管理</h1>
                    <p className="text-zinc-400 text-sm mt-1">共 {orders?.length || 0} 筆訂單</p>
                </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                    <Link
                        key={filter.value}
                        href={`/admin/stores/${storeId}/orders${filter.value === 'all' ? '' : `?status=${filter.value}`}`}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className={`border-zinc-700 ${(status === filter.value || (!status && filter.value === 'all'))
                                    ? 'bg-white text-black hover:bg-white'
                                    : 'text-zinc-300 hover:text-white'
                                }`}
                        >
                            {filter.label}
                        </Button>
                    </Link>
                ))}
            </div>

            {orders && orders.length > 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-zinc-800/50">
                            <tr className="text-left">
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400">訂單編號</th>
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400">客戶</th>
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400">金額</th>
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400">狀態</th>
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400">時間</th>
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {orders.map((order) => {
                                const config = statusConfig[order.status] || statusConfig.pending
                                const StatusIcon = config.icon
                                return (
                                    <tr key={order.id} className="hover:bg-zinc-800/30">
                                        <td className="px-4 py-3">
                                            <p className="font-mono text-sm text-white">{order.order_number}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-white">{order.customer_name}</p>
                                                <p className="text-xs text-zinc-500">{order.customer_phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-white font-medium">
                                                NT$ {Number(order.total).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${config.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {config.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-zinc-400">
                                                {new Date(order.created_at).toLocaleDateString('zh-TW')}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={`/admin/stores/${storeId}/orders/${order.id}`}>
                                                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                                    查看
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <ClipboardList className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">尚未有任何訂單</h3>
                    <p className="text-zinc-400 mt-1">當客戶下單後，訂單會顯示在這裡</p>
                </div>
            )}
        </div>
    )
}
