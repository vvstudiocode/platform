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
        pending: 'bg-amber-50 text-amber-700 border border-amber-100',
        paid: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        processing: 'bg-blue-50 text-blue-700 border border-blue-100',
        shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
        completed: 'bg-slate-50 text-slate-700 border border-slate-100',
        cancelled: 'bg-red-50 text-red-700 border border-red-100',
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-serif font-bold text-foreground">儀表板</h1>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-muted-foreground">商品數量</span>
                    </div>
                    <p className="text-3xl font-serif font-bold text-foreground">{totalProducts}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="text-muted-foreground">總訂單數</span>
                    </div>
                    <p className="text-3xl font-serif font-bold text-foreground">{totalOrders}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-muted-foreground">總營收</span>
                    </div>
                    <p className="text-3xl font-serif font-bold text-foreground">NT$ {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-amber-600" />
                        </div>
                        <span className="text-muted-foreground">待處理訂單</span>
                    </div>
                    <p className="text-3xl font-serif font-bold text-foreground">{pendingOrders}</p>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-soft">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-serif font-semibold text-foreground">最近訂單</h2>
                    <Link href="/app/orders" className="text-sm text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
                        查看全部 <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
                {recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-6 py-3 text-sm font-serif font-medium text-muted-foreground">訂單編號</th>
                                    <th className="text-left px-6 py-3 text-sm font-serif font-medium text-muted-foreground">客戶</th>
                                    <th className="text-left px-6 py-3 text-sm font-serif font-medium text-muted-foreground">金額</th>
                                    <th className="text-left px-6 py-3 text-sm font-serif font-medium text-muted-foreground">狀態</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-3 font-mono text-foreground">{order.order_number}</td>
                                        <td className="px-6 py-3 text-muted-foreground">{order.customer_name}</td>
                                        <td className="px-6 py-3 text-foreground">NT$ {Number(order.total).toLocaleString()}</td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status || 'pending'] || 'bg-muted text-muted-foreground'}`}>
                                                {statusLabels[order.status || 'pending'] || order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center text-muted-foreground">
                        尚無訂單
                    </div>
                )}
            </div>
        </div>
    )
}
