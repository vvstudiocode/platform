import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
    LayoutDashboard,
    Store,
    LogOut,
    Settings,
    Package,
    ShoppingCart,
    FileText,
    ExternalLink
} from 'lucide-react'

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/app/login')
    }

    // 取得用戶的商店
    const { data: userRole } = await supabase
        .from('users_roles')
        .select('tenant_id, role, tenants:tenant_id(id, name, slug, logo_url)')
        .eq('user_id', user.id)
        .in('role', ['store_owner', 'store_admin'])
        .single()

    // 如果沒有商店，重定向到 onboarding
    if (!userRole?.tenants) {
        redirect('/app/onboarding')
    }

    const store = userRole.tenants as any

    const navItems = [
        { href: '/app', icon: LayoutDashboard, label: '儀表板' },
        { href: '/app/products', icon: Package, label: '商品管理' },
        { href: '/app/orders', icon: ShoppingCart, label: '訂單管理' },
        { href: '/app/pages', icon: FileText, label: '頁面管理' },
        { href: '/app/settings', icon: Settings, label: '商店設定' },
    ]

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950">
            <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {store.logo_url ? (
                        <img src={store.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                        <Store className="h-5 w-5 text-white" />
                    )}
                    <span className="font-bold text-white">{store.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href={`/store/${store.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
                    >
                        <ExternalLink className="h-4 w-4" />
                        查看商店
                    </Link>
                    <span className="text-sm text-zinc-400">{user.email}</span>
                    <form action="/api/auth/signout" method="POST">
                        <button type="submit" className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm">
                            <LogOut className="h-4 w-4" />
                            登出
                        </button>
                    </form>
                </div>
            </header>
            <div className="flex flex-1">
                <aside className="w-56 border-r border-zinc-800 bg-zinc-900 p-4 overflow-y-auto">
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
