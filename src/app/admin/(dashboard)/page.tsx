import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Store, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react'

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
        },
        {
            title: '本月訂單',
            value: 0,
            icon: ShoppingCart,
            href: '/admin/orders',
        },
        {
            title: '本月營收',
            value: '$0',
            icon: DollarSign,
            href: '/admin/orders',
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
                    <Link
                        key={stat.title}
                        href={stat.href}
                        className="rounded-xl border border-border bg-card p-6 hover:border-accent hover:shadow-soft transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <stat.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        </div>
                        <p className="text-3xl font-serif font-bold text-foreground mt-4">{stat.value}</p>
                        <h3 className="font-medium text-muted-foreground mt-1">{stat.title}</h3>
                    </Link>
                ))}
            </div>

            {/* Recent Stores */}
            <div className="rounded-xl border border-border bg-card shadow-soft">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-serif font-semibold text-foreground">最近建立的商店</h2>
                    <Link href="/admin/stores" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                        查看全部
                    </Link>
                </div>
                <div className="divide-y divide-border">
                    {recentStores && recentStores.length > 0 ? (
                        recentStores.map((store) => (
                            <Link
                                key={store.id}
                                href={`/admin/stores/${store.id}`}
                                className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group"
                            >
                                <div>
                                    <p className="font-medium text-foreground group-hover:text-primary">{store.name}</p>
                                    <p className="text-sm text-muted-foreground">{store.slug}.yourdomain.com</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                            </Link>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center">
                            <p className="text-muted-foreground">尚未建立任何商店</p>
                            <Link
                                href="/admin/stores/new"
                                className="inline-block mt-3 text-sm text-accent hover:underline font-medium"
                            >
                                建立第一家商店 →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
