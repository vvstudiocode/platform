import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Store, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 取得管理的商店數量
    const { count: storeCount } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('managed_by', user?.id || '')

    // 取得最近建立的商店
    const { data: recentStores } = await supabase
        .from('tenants')
        .select('id, name, slug, created_at')
        .eq('managed_by', user?.id || '')
        .order('created_at', { ascending: false })
        .limit(5)

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
            title: '本月訂單',
            value: 0,
            icon: ShoppingCart,
            href: '/admin/orders',
            iconColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            description: '所有商店加總'
        },
        {
            title: '本月營收',
            value: '$0',
            icon: DollarSign,
            href: '/admin/orders',
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            description: '所有商店加總'
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">儀表板</h1>
                <p className="text-muted-foreground mt-1">歡迎回來，這是您的總部管理概覽</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.title}
                        {...stat}
                    />
                ))}
            </div>

            {/* Recent Stores */}
            <div className="grid gap-8">
                <RecentActivity
                    title="最近建立的商店"
                    viewAllHref="/admin/stores"
                    type="stores"
                    items={recentStores?.map(store => ({
                        id: store.id,
                        title: store.name,
                        subtitle: `${store.slug}.yourdomain.com`,
                        href: `/admin/stores/${store.id}`
                    })) || []}
                    emptyMessage="尚未建立任何商店"
                />
            </div>
        </div>
    )
}
