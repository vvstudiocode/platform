import { createClient } from '@/lib/supabase/server'
import { NavigationManager } from './navigation-manager'

export default async function NavigationPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div className="p-6 text-red-500">請先登入</div>
    }

    // 取得總部商店
    const { data: hqStore } = await supabase
        .from('tenants')
        .select('id')
        .or(`slug.eq.hq,managed_by.eq.${user.id}`)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    if (!hqStore) {
        return <div className="p-6 text-red-500">找不到總部商店</div>
    }

    // 取得目前的導覽項目
    const { data: navItems } = await supabase
        .from('nav_items')
        .select('id, title, position, page_id, pages(title, slug)')
        .eq('tenant_id', hqStore.id)
        .order('position', { ascending: true })

    // 取得所有已發布的頁面（用於選擇器）
    const { data: pages } = await supabase
        .from('pages')
        .select('id, title, slug')
        .eq('tenant_id', hqStore.id)
        .eq('published', true)
        .order('title', { ascending: true })

    return (
        <div className="p-6">
            <NavigationManager
                navItems={(navItems || []) as any}
                availablePages={pages || []}
            />
        </div>
    )
}
