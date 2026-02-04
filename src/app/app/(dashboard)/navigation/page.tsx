import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavigationManager } from './navigation-manager'

export default async function AppNavigationPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/app/login')
    }

    // 取得用戶的商店
    const { data: userRole } = await supabase
        .from('users_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .in('role', ['store_owner', 'store_admin'])
        .single()

    if (!userRole?.tenant_id) {
        redirect('/app/onboarding')
    }

    const storeId = userRole.tenant_id

    // 取得目前的導覽項目
    const { data: navItems } = await supabase
        .from('nav_items')
        .select('id, title, position, page_id, parent_id, pages(title, slug)')
        .eq('tenant_id', storeId)
        .order('position', { ascending: true })

    // 取得所有已發布的頁面（用於選擇器）
    const { data: pages } = await supabase
        .from('pages')
        .select('id, title, slug')
        .eq('tenant_id', storeId)
        .eq('published', true)
        .order('title', { ascending: true })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">導覽目錄管理</h1>
                <p className="text-zinc-400 text-sm mt-1">拖拉調整選單順序，管理網站導覽列</p>
            </div>
            <NavigationManager
                navItems={(navItems || []) as any}
                availablePages={pages || []}
            />
        </div>
    )
}
