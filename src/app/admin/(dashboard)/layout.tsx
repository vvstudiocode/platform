import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
    Store,
    LogOut,
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

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

    // 檢查是否為 super_admin
    const { data: role, error: roleError } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .limit(1)
        .maybeSingle()

    console.log('User ID:', user.id)
    console.log('Role Query Result:', role)
    console.log('Role Query Error:', roleError)

    if (!role) {
        redirect('/admin/login?error=unauthorized')
    }

    // 取得總部商店（slug = 'hq' 或第一個 managed_by 為當前用戶的商店）
    const { data: hqStore } = await supabase
        .from('tenants')
        .select('id, slug')
        .eq('managed_by', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    // 取得設定的首頁
    const { data: homepage } = await supabase
        .from('pages')
        .select('slug')
        .eq('tenant_id', hqStore?.id)
        .eq('is_homepage', true)
        .eq('published', true)
        .maybeSingle()

    const homeUrl = homepage?.slug ? `/p/${homepage.slug}` : '/p/home'

    // 導覽分區（使用字串圖標名稱以便序列化）
    const navSections = [
        {
            title: '總覽',
            items: [
                { href: '/admin', icon: 'LayoutDashboard', label: '儀表板' },
            ]
        },
        {
            title: '總部商店',
            items: [
                { href: '/admin/products', icon: 'Package', label: '商品管理' },
                { href: '/admin/orders', icon: 'ShoppingCart', label: '訂單管理' },
                { href: '/admin/pages', icon: 'FileText', label: '頁面管理' },
                { href: '/admin/navigation', icon: 'Menu', label: '導覽目錄' },
            ]
        },
        {
            title: '平台管理',
            items: [
                { href: '/admin/stores', icon: 'Store', label: '子商店管理' },
                { href: '/admin/settings', icon: 'Settings', label: '系統設定' },
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
                    <span className="text-sm text-zinc-400 hidden sm:block">{user.email}</span>
                    <a
                        href={homeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm border border-zinc-700 rounded-lg px-3 py-1.5 hover:bg-zinc-800 transition-colors"
                    >
                        前往首頁
                    </a>
                    <form action="/api/auth/signout" method="POST">
                        <button type="submit" className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">登出</span>
                        </button>
                    </form>
                </div>
            </header>
            <DashboardLayout navSections={navSections}>
                {children}
            </DashboardLayout>
        </div>
    )
}
