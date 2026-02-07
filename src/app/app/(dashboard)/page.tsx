import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'

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

    const stats = [
        {
            title: '商品數量',
            value: totalProducts,
            icon: Package,
            href: '/app/products',
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: '總訂單數',
            value: totalOrders,
            icon: ShoppingCart,
            href: '/app/orders',
            iconColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
        {
            title: '總營收',
            value: `NT$ ${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            href: '/app/orders',
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: '待處理訂單',
            value: pendingOrders,
            icon: TrendingUp,
            href: '/app/orders?status=pending',
            iconColor: 'text-amber-600',
            bgColor: 'bg-amber-50',
        },
    ]

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">儀表板</h1>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Recent Orders */}
            <div className="grid gap-8">
                <RecentActivity
                    title="最近訂單"
                    viewAllHref="/app/orders"
                    type="orders"
                    items={recentOrders.map(order => ({
                        id: order.id,
                        title: order.customer_name || '未知客戶',
                        subtitle: order.order_number,
                        value: `NT$ ${Number(order.total).toLocaleString()}`,
                        status: {
                            label: statusLabels[order.status || 'pending'],
                            color: statusColors[order.status || 'pending']
                        },
                        href: `/app/orders/${order.id}` // 假設有訂單詳情頁
                    }))}
                    emptyMessage="尚無訂單"
                />
            </div>
        </div>
    )
}
