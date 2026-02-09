import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Store, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { CalendarDateRangePicker } from '@/components/dashboard/date-range-picker'
import { getDateRangeFromParams } from '@/lib/dashboard-utils'
import { TopStores } from '@/components/dashboard/top-stores'
import { RevenueCompositionChart } from '@/components/dashboard/revenue-composition-chart'
import { TopProductsChart } from '@/components/dashboard/top-products-chart'
import { AovTrendChart } from '@/components/dashboard/aov-trend-chart'
import { CustomerRetentionChart } from '@/components/dashboard/customer-retention-chart'
import { ExportButton } from '@/components/dashboard/export-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export default async function AdminDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ from?: string; to?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const params = await searchParams

    // 取得管理的商店
    const { data: managedStores, count: storeCount } = await supabase
        .from('tenants')
        .select('id, name, slug, created_at')
        .eq('managed_by', user?.id || '')
        .order('created_at', { ascending: false })

    const storeMap = new Map(managedStores?.map(s => [s.id, s]) || [])

    // 取得所有製品成本與名稱
    const { data: products } = await supabase
        .from('products')
        .select('id, name, cost')

    const productCostMap = new Map(products?.map(p => [p.id, Number(p.cost || 0)]) || [])
    const productNameMap = new Map(products?.map(p => [p.id, p.name]) || [])

    // 取得訂單數據 (依據日期篩選)
    const { from, to } = getDateRangeFromParams(params)
    const fromISO = from.toISOString()
    const toISO = to.toISOString()

    // 確保這裡使用的是正確的日期範圍
    // 注意：getDateRangeFromParams 預設回傳的是 Date 物件

    const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', fromISO)
        .lte('created_at', toISO) // 使用 lte 搭配整天範圍
        .neq('status', 'cancelled')

    // 計算統計數據
    const monthlyOrderCount = monthlyOrders?.length || 0
    let monthlyRevenue = 0
    let monthlyProfit = 0

    // 店鋪聚合數據
    const storeStatsMap = new Map<string, { revenue: number, orders: number }>()

    // 商品聚合數據
    const productStatsMap = new Map<string, { revenue: number, count: number }>()

    // AOV 趨勢數據 (每日)
    const dailyAovMap = new Map<string, { revenue: number, orders: number }>()

    // 客戶類型數據 (會員/訪客)
    let memberOrders = 0
    let guestOrders = 0

    monthlyOrders?.forEach(order => {
        const orderTotal = Number(order.total_amount || order.total || 0)
        const shippingFee = Number(order.shipping_fee || 0)
        const tenantId = order.tenant_id
        const orderDate = order.created_at ? format(new Date(order.created_at), 'yyyy-MM-dd') : 'Unknown'
        // 假設有 user_id 欄位，若無則全部視為訪客或忽略
        const isMember = !!(order as any).user_id

        // 全局營收
        monthlyRevenue += orderTotal

        // 店鋪聚合
        if (tenantId) {
            const currentObj = storeStatsMap.get(tenantId) || { revenue: 0, orders: 0 }
            storeStatsMap.set(tenantId, {
                revenue: currentObj.revenue + orderTotal,
                orders: currentObj.orders + 1
            })
        }

        // 每日 AOV 聚合
        const currentDaily = dailyAovMap.get(orderDate) || { revenue: 0, orders: 0 }
        dailyAovMap.set(orderDate, {
            revenue: currentDaily.revenue + orderTotal,
            orders: currentDaily.orders + 1
        })

        // 客戶類型聚合
        if (isMember) {
            memberOrders++
        } else {
            guestOrders++
        }

        // 成本計算與商品聚合
        let orderCost = shippingFee
        const items = Array.isArray(order.items) ? order.items : []
        items.forEach((item: any) => {
            const productId = item.product_id
            const quantity = Number(item.quantity || 0)
            const unitCost = productCostMap.get(productId) || 0

            // 利潤成本
            orderCost += unitCost * quantity

            // 商品熱銷統計
            // 簡化估算： quantity * (item.price || 0)
            const itemPrice = Number(item.price || item.unit_price || 0)
            const itemRevenue = itemPrice * quantity

            const currentProd = productStatsMap.get(productId) || { revenue: 0, count: 0 }
            productStatsMap.set(productId, {
                revenue: currentProd.revenue + itemRevenue,
                count: currentProd.count + quantity
            })
        })

        monthlyProfit += (orderTotal - orderCost)
    })

    // 準備 Top Stores 數據
    const topStoresData = Array.from(storeStatsMap.entries())
        .map(([tenantId, stats]) => {
            const store = storeMap.get(tenantId)
            return {
                name: store?.name || '未知商店',
                slug: store?.slug || 'unknown',
                revenue: stats.revenue,
                orders: stats.orders
            }
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

    // 準備營收組合圖數據
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#ec4899', '#8b5cf6'] // Amber, Emerald, Blue, Indigo, Pink, Violet
    const revenueCompositionData = Array.from(storeStatsMap.entries())
        .map(([tenantId, stats], index) => {
            const store = storeMap.get(tenantId)
            return {
                name: store?.name || '未知商店',
                value: stats.revenue,
                color: colors[index % colors.length]
            }
        })
        .sort((a, b) => b.value - a.value)

    // 準備 Top Products 數據
    const topProductsData = Array.from(productStatsMap.entries())
        .map(([productId, stats]) => {
            const name = productNameMap.get(productId) || '未知商品'
            return {
                name: name,
                revenue: stats.revenue,
                count: stats.count
            }
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

    // 準備 AOV Trend 數據
    const aovTrendData = Array.from(dailyAovMap.entries())
        .map(([date, stats]) => ({
            date,
            aov: stats.orders > 0 ? Math.round(stats.revenue / stats.orders) : 0
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // 準備 Customer Retention (Type) 數據
    const customerTypeData = [
        { name: '會員訂單', value: memberOrders, color: '#3b82f6' },
        { name: '訪客訂單', value: guestOrders, color: '#94a3b8' }
    ].filter(d => d.value > 0)

    const stats = [
        {
            title: '管理中的商店',
            value: storeCount || 0,
            icon: Store,
            href: '/admin/stores',
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: '期間訂單',
            value: monthlyOrderCount,
            icon: ShoppingCart,
            href: '/admin/orders',
            iconColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            description: '所有商店加總'
        },
        {
            title: '期間營收',
            value: `NT$ ${monthlyRevenue.toLocaleString()}`,
            icon: DollarSign,
            href: '/admin/orders',
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            description: '所有商店加總'
        },
        {
            title: '期間淨利',
            value: `NT$ ${monthlyProfit.toLocaleString()}`,
            icon: DollarSign, // 可以換一個 Icon 比如 TrendingUp
            href: '/admin/orders',
            iconColor: 'text-amber-600',
            bgColor: 'bg-amber-50',
            description: '扣除成本與運費'
        },
    ]

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

            {/* Charts & Store List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>店鋪業績排行榜</CardTitle>
                        <CardDescription>營收最高的前 5 名商店</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TopStores data={topStoresData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>整體營收組合</CardTitle>
                        <CardDescription>各分店營收貢獻比例</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueCompositionChart data={revenueCompositionData} />
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>每日平均客單價 (AOV)</CardTitle>
                        <CardDescription>觀察客單價變化趨勢</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AovTrendChart data={aovTrendData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>熱銷商品排行</CardTitle>
                        <CardDescription>營收貢獻最高的商品</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TopProductsChart data={topProductsData} />
                    </CardContent>
                </Card>
            </div>

            {/* Customer Type & Recent Stores */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-3 border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle>訂單客戶類型</CardTitle>
                        <CardDescription>會員與訪客訂單比例</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CustomerRetentionChart data={customerTypeData} />
                    </CardContent>
                </Card>
                <div className="col-span-4">
                    <RecentActivity
                        title="最近建立的商店"
                        viewAllHref="/admin/stores"
                        type="stores"
                        items={managedStores?.slice(0, 5).map(store => ({
                            id: store.id,
                            title: store.name,
                            subtitle: `${store.slug}.yourdomain.com`,
                            href: `/admin/stores/${store.id}`
                        })) || []}
                        emptyMessage="尚未建立任何商店"
                    />
                </div>
            </div>
        </div>
    )
}
