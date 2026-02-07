import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavigationManager } from '@/features/navigation/components/navigation-manager'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// 取得總部商店的 Tenant ID
async function getHQStoreId(supabase: any, user: any) {
    const { data } = await supabase
        .from('tenants')
        .select('id')
        .eq('managed_by', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()
    return data?.id
}

export default async function AdminNavigationPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const hqStoreId = await getHQStoreId(supabase, user)

    if (!hqStoreId) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-serif font-bold text-foreground">導覽目錄管理</h1>
                <div className="bg-card rounded-xl border border-border p-12 text-center shadow-soft">
                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Menu className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-6">尚未建立總部商店，無法設定導覽</p>
                    <Link href="/admin/stores/new">
                        <Button className="shadow-soft">建立總部商店</Button>
                    </Link>
                </div>
            </div>
        )
    }

    // 取得目前的導覽項目
    const { data: navItems } = await supabase
        .from('nav_items')
        .select('id, title, position, page_id, parent_id, pages(title, slug)')
        .eq('tenant_id', hqStoreId)
        .order('position', { ascending: true })

    // 取得所有已發布的頁面
    const { data: pages } = await supabase
        .from('pages')
        .select('id, title, slug')
        .eq('tenant_id', hqStoreId)
        .eq('published', true)
        .order('title', { ascending: true })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">導覽目錄管理</h1>
                <p className="text-muted-foreground mt-1">設定總部網站導覽列</p>
            </div>
            <NavigationManager
                navItems={(navItems || []) as any}
                availablePages={pages || []}
            />
        </div>
    )
}
