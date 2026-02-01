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
    Users
} from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    // 檢查是否為 platform_admin
    const { data: role } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'platform_admin')
        .single()

    if (!role) {
        redirect('/admin/login?error=您沒有管理員權限')
    }

    // 取得總部商店（slug = 'hq' 或第一個 managed_by 為當前用戶的商店）
    const { data: hqStore } = await supabase
        .from('tenants')
        .select('id, slug')
        .eq('managed_by', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    const navSections = [
        {
            title: '總覽',
            items: [
                { href: '/admin', icon: LayoutDashboard, label: '儀表板' },
            ]
        },
        {
            title: '總部商店',
            items: [
                { href: '/admin/products', icon: Package, label: '商品管理' },
                { href: '/admin/orders', icon: ShoppingCart, label: '訂單管理' },
                { href: '/admin/pages', icon: FileText, label: '頁面管理' },
            ]
        },
        {
            title: '平台管理',
            items: [
                { href: '/admin/stores', icon: Store, label: '子商店管理' },
                { href: '/admin/settings', icon: Settings, label: '系統設定' },
            ]
        },
    ]

    return (
        <div className="flex min-h-screen flex-col bg-zinc-950">
            <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 flex justify-between items-center">
                <Link href="/admin" className="font-bold text-white flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    總部管理後台
                </Link>
                <div className="flex items-center gap-4">
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
                    <nav className="space-y-6">
                        {navSections.map((section) => (
                            <div key={section.title}>
                                <h3 className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
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
