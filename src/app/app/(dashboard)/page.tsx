import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Store, ShoppingCart, DollarSign, Package, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { OrderStatusChart } from '@/components/dashboard/order-status-chart'
import { CalendarDateRangePicker } from '@/components/dashboard/date-range-picker'
import { getDateRangeFromParams } from '@/lib/dashboard-utils'
import { TopProductsChart } from '@/components/dashboard/top-products-chart'
import { AovTrendChart } from '@/components/dashboard/aov-trend-chart'
import { CustomerRetentionChart } from '@/components/dashboard/customer-retention-chart'
import { ExportButton } from '@/components/dashboard/export-button'
import { format } from 'date-fns'

export default async function AppDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ from?: string; to?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const params = await searchParams

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h1 className="text-2xl font-bold">請先登入</h1>
                <Link
                    href="/app/login"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    前往登入
                </Link>
            </div>
        )
    }

    // 取得當前用戶的商店 (透過 users_roles)
    const { data: userRole } = await supabase
        .from('users_roles')
        .select('tenant_id, tenants:tenant_id(*)')
        .eq('user_id', user.id)
        .in('role', ['store_owner', 'store_admin'])
        .single()

    const store = userRole?.tenants as any

    if (!store) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h1 className="text-2xl font-bold">尚未建立商店</h1>
                <p className="text-muted-foreground">請先建立您的商店以開始使用</p>
                <Link
                    href="/app/onboarding"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    立即建立
                </Link>
            </div>
        )
    }

    const storeId = store.id

    // 設定日期範圍
    const { from, to } = getDateRangeFromParams(params)
    const fromISO = from.toISOString()
    const toISO = to.toISOString()

    // 取得統計資料（依據日期範圍）
    const [productsResult, ordersResult, pendingOrdersResult] = await Promise.all([
        supabase.from('products').select('id, name, cost').eq('tenant_id', storeId),
        supabase.from('orders').select('*')
            .eq('tenant_id', storeId)
            .neq('status', 'cancelled')
            .gte('created_at', fromISO)
            .lte('created_at', toISO),
        supabase.from('orders').select('id', { count: 'exact', head: true })
            .eq('tenant_id', storeId)
            .eq('status', 'pending')
            .gte('created_at', fromISO) // 待處理訂單通常看當前的，但也受時間篩選影響比較一致
            .lte('created_at', toISO),
    ])

    const products = productsResult.data || []
    const orders = ordersResult.data || []
    const pendingOrdersCount = pendingOrdersResult.count || 0

    // 建立產品成本Map
    const productCostMap = new Map(products.map(p => [p.id, Number(p.cost || 0)]))
    const productNameMap = new Map(products.map(p => [p.id, p.name]))

    // 計算統計數據
    const totalOrders = orders.length
    let totalRevenue = 0
    let totalProfit = 0

    // 圖表數據準備
    const revenueMap = new Map<string, number>()
    const orderStatusMap = new Map<string, number>()
    const productStatsMap = new Map<string, { revenue: number, count: number }>() // Top Products
    const dailyAovMap = new Map<string, { revenue: number, orders: number }>() // AOV
    let memberOrders = 0 // Retention
    let guestOrders = 0

    // 初始化狀態計數
    const statuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled']
    statuses.forEach(s => orderStatusMap.set(s, 0))

    // Safe cast to avoid type inference issues
    const safeOrders = (orders || []) as any[]

    safeOrders.forEach(order => {
        const orderTotal = Number(order.total_amount || order.total || 0)
        const shippingFee = Number(order.shipping_fee || 0)
        const date = order.created_at ? new Date(order.created_at).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }) : '未知日期'
        const orderDateKey = order.created_at ? format(new Date(order.created_at), 'yyyy-MM-dd') : 'Unknown'
        // 需要確認 order 是否有 user_id 欄位。若無，則此行可能會出錯，需視資料庫結構而定。
        // 為避免錯誤，這裡使用安全存取。
        const isMember = !!(order as any).user_id

        // 營收
        totalRevenue += orderTotal

        // 每日營收
        revenueMap.set(date, (revenueMap.get(date) || 0) + orderTotal)

        // 每日 AOV
        const currentDaily = dailyAovMap.get(orderDateKey) || { revenue: 0, orders: 0 }
        dailyAovMap.set(orderDateKey, {
            revenue: currentDaily.revenue + orderTotal,
            orders: currentDaily.orders + 1
        })

        // 訂單狀態
        const status = order.status || 'pending'
        orderStatusMap.set(status, (orderStatusMap.get(status) || 0) + 1)

        // 客戶類型
        if (isMember) memberOrders++; else guestOrders++;

        // 成本
        let orderCost = shippingFee
        const items = Array.isArray(order.items) ? order.items : []
        items.forEach((item: any) => {
            const productId = item.product_id
            const quantity = Number(item.quantity || 0)
            const unitCost = productCostMap.get(productId) || 0
            orderCost += unitCost * quantity

            // Top Products
            const itemPrice = Number(item.price || item.unit_price || 0)
            const itemRevenue = itemPrice * quantity
            const currentProd = productStatsMap.get(productId) || { revenue: 0, count: 0 }
            productStatsMap.set(productId, {
                revenue: currentProd.revenue + itemRevenue,
                count: currentProd.count + quantity
            })
        })

        totalProfit += (orderTotal - orderCost)
    })

    // 轉換圖表數據格式
    const revenueData = Array.from(revenueMap.entries())
        .map(([date, total]) => ({ date, total }))
        // 簡單排序，實際可能需要更精確的日期處理
        .reverse()

    const statusColors: Record<string, string> = {
        pending: '#f59e0b', // amber-500
        paid: '#3b82f6',    // blue-500
        shipped: '#8b5cf6', // violet-500
        completed: '#10b981', // emerald-500
        cancelled: '#ef4444', // red-500
    }

    const statusLabels: Record<string, string> = {
        pending: '待處理',
        paid: '已付款',
        shipped: '已出貨',
        completed: '已完成',
        cancelled: '已取消'
    }

    const orderStatusData = Array.from(orderStatusMap.entries())
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
            name: statusLabels[name] || name,
            value,
            color: statusColors[name] || '#94a3b8'
        }))

    // Top Products Data
    const topProductsData = Array.from(productStatsMap.entries())
        .map(([productId, stats]) => {
            const name = productNameMap.get(productId) || '未知商品'
            return {
                name,
                revenue: stats.revenue,
                count: stats.count
            }
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

    // AOV Trend Data
    const aovTrendData = Array.from(dailyAovMap.entries())
        .map(([date, stats]) => ({
            date,
            aov: stats.orders > 0 ? Math.round(stats.revenue / stats.orders) : 0
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Customer Retention Data
    const customerTypeData = [
        { name: '會員訂單', value: memberOrders, color: '#3b82f6' },
        { name: '訪客訂單', value: guestOrders, color: '#94a3b8' }
    ].filter(d => d.value > 0)


    const stats = [
        {
            title: '期間營收',
            value: `NT$ ${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            href: '/app/orders',
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: '期間利潤',
            value: `NT$ ${totalProfit.toLocaleString()}`,
            icon: TrendingUp,
            href: '/app/orders',
            iconColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            description: '扣除成本與運費'
        },
        {
            title: '期間訂單',
            value: totalOrders,
            icon: Package,
            href: '/app/orders',
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: '待處理訂單',
            value: pendingOrdersCount,
            icon: Clock,
            href: '/app/orders?status=pending',
            iconColor: 'text-amber-600',
            bgColor: 'bg-amber-50',
            description: '需盡快處理'
        },
    ]

    // 最近訂單
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('*, customer:customer_info')
        .eq('tenant_id', storeId)
        .order('created_at', { ascending: false })
        .limit(5)

    // Safe cast for recent orders
    const safeRecentOrders = (recentOrders || []) as any[]

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                </div>
                <div className="flex items-center gap-2">
                    <ExportButton />
                    <CalendarDateRangePicker />

                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.title}
                        {...stat}
                    />
                ))}
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4 border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>營收趨勢</CardTitle>
                        <CardDescription>期間每日營收變化</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RevenueChart data={revenueData} />
                    </CardContent>
                </Card>
                <Card className="col-span-full lg:col-span-3 border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>訂單狀態</CardTitle>
                        <CardDescription>期間訂單分佈</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OrderStatusChart data={orderStatusData} />
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4 border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>每日平均客單價 (AOV)</CardTitle>
                        <CardDescription>觀察客單價變化趨勢</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AovTrendChart data={aovTrendData} />
                    </CardContent>
                </Card>
                <Card className="col-span-full lg:col-span-3 border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>熱銷商品排行</CardTitle>
                        <CardDescription>營收貢獻最高的商品</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TopProductsChart data={topProductsData} />
                    </CardContent>
                </Card>
            </div>

            {/* Customer & Recent Orders */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-3 border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>訂單客戶類型</CardTitle>
                        <CardDescription>會員與訪客訂單比例</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CustomerRetentionChart data={customerTypeData} />
                    </CardContent>
                </Card>

                <div className="col-span-full md:col-span-4 lg:col-span-4">
                    <RecentActivity
                        title="最近訂單"
                        viewAllHref="/app/orders"
                        type="orders"
                        items={safeRecentOrders.map(order => ({
                            id: order.id,
                            title: `訂單 #${order.id.slice(0, 8)}`,
                            subtitle: `${(order as any).customer?.name || '訪客'} • NT$ ${(order.total_amount || 0).toLocaleString()}`,
                            status: order.status,
                            date: new Date(order.created_at).toLocaleDateString()
                        }))}
                        emptyMessage="近期無訂單"
                    />
                </div>
            </div>
        </div>
    )
}
