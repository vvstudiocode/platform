import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
    Store,
    LogOut,
    ExternalLink,
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'


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

    // 取得設定的首頁
    const { data: homepage } = await supabase
        .from('pages')
        .select('slug')
        .eq('tenant_id', store.id)
        .eq('is_homepage', true)
        .eq('published', true)
        .maybeSingle()

    // 如果有設定首頁，指向該頁面；否則指向商店首頁（商品列表）
    const homeUrl = homepage?.slug
        ? `/store/${store.slug}/page/${homepage.slug}`
        : `/store/${store.slug}`

    // navItems 使用字串名稱而非組件，以便序列化傳遞給 Client Component
    const navItems = [
        { href: '/app', icon: 'LayoutDashboard', label: '儀表板' },
        { href: '/app/products', icon: 'Package', label: '商品管理' },
        { href: '/app/orders', icon: 'ShoppingCart', label: '訂單管理' },
        { href: '/app/pages', icon: 'FileText', label: '頁面管理' },
        { href: '/app/navigation', icon: 'Menu', label: '導覽目錄' },
        { href: '/app/settings', icon: 'Settings', label: '商店設定' },
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
                    <a
                        href={homeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm border border-zinc-700 rounded-lg px-3 py-1.5 hover:bg-zinc-800 transition-colors"
                    >
                        前往首頁
                    </a>
                    <span className="text-sm text-zinc-400">{user.email}</span>
                    <form action="/api/auth/signout" method="POST">
                        <button type="submit" className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm">
                            <LogOut className="h-4 w-4" />
                            登出
                        </button>
                    </form>
                </div>
            </header>
            <DashboardLayout navItems={navItems}>
                {children}
            </DashboardLayout>
        </div>
    )
}
