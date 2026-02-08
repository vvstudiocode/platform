import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
    Store,
    LogOut,
    Settings,
} from 'lucide-react'
import type { Metadata } from 'next'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export async function generateMetadata(): Promise<Metadata> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { title: 'OMO網站平台' }
    }

    // 取得總部商店名稱
    const { data: hqStore } = await supabase
        .from('tenants')
        .select('name')
        .eq('managed_by', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    return {
        title: hqStore?.name ? `${hqStore.name} 後台` : 'OMO網站平台'
    }
}

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
        .select('id, slug, name')
        .eq('managed_by', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()


    // 取得設定的首頁
    const { data: homepage } = await supabase
        .from('pages')
        .select('slug')
        .eq('tenant_id', hqStore?.id || '')
        .eq('is_homepage', true)
        .eq('published', true)
        .maybeSingle()

    const homeUrl = hqStore?.slug === 'omo'
        ? '/'
        : hqStore?.slug
            ? `/store/${hqStore.slug}${homepage?.slug ? `/${homepage.slug}` : ''}`
            : '/'

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
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <Link href="/admin" className="font-bold text-foreground flex items-center gap-2 font-serif">
                    <div className="p-1.5 bg-accent/10 rounded-lg">
                        <Store className="h-5 w-5 text-accent" />
                    </div>
                    {hqStore?.name || '總部'} 後台
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/admin/settings" className="md:hidden text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">設定</span>
                    </Link>
                    <a
                        href={homeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
                    >
                        前往首頁
                    </a>
                    <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
                    <form action="/api/auth/signout" method="POST">
                        <button type="submit" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
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
