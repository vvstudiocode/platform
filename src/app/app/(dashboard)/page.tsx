import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react'

async function getUserStore(supabase: any, userId: string) {
    const { data: userRole } = await supabase
        .from('users_roles')
        .select('tenant_id')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()

    return userRole?.tenant_id
}

export default async function AppDashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/app/login')

    const storeId = await getUserStore(supabase, user.id)
    if (!storeId) redirect('/app/onboarding')

    // 取得統計資料
    const [productsResult, ordersResult, pendingOrdersResult, recentOrdersResult] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('tenant_id', storeId),
        supabase.from('orders').select('total').eq('tenant_id', storeId),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('tenant_id', storeId).eq('status', 'pending'),
        supabase.from('orders').select('*').eq('tenant_id', storeId).order('created_at', { ascending: false }).limit(5),
    ])

    const totalProducts = productsResult.count || 0
    const totalOrders = ordersResult.data?.length || 0
    const totalRevenue = ordersResult.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0
    const pendingOrders = pendingOrdersResult.count || 0
    const recentOrders = recentOrdersResult.data || []

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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">儀表板</h1>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Package className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-zinc-400">商品數量</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalProducts}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-emerald-400" />
                        </div>
                        <span className="text-zinc-400">總訂單數</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalOrders}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <DollarSign className="h-5 w-5 text-purple-400" />
                        </div>
                        <span className="text-zinc-400">總營收</span>
                    </div>
                    <p className="text-3xl font-bold text-white">NT$ {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-amber-400" />
                        </div>
                        <span className="text-zinc-400">待處理訂單</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{pendingOrders}</p>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">最近訂單</h2>
                    <Link href="/app/orders" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        查看全部 <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
                {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">訂單編號</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">客戶</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">金額</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">狀態</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-zinc-800">
                                        <td className="px-6 py-3 font-mono text-white">{order.order_number}</td>
                                        <td className="px-6 py-3 text-zinc-300">{order.customer_name}</td>
                                        <td className="px-6 py-3 text-white">NT$ {Number(order.total).toLocaleString()}</td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                                {statusLabels[order.status]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center text-zinc-500">
                        尚無訂單
                    </div>
                )}
            </div>
        </div>
    )
}
