import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageList } from '@/features/pages/components/page-list'
import { deletePage } from './actions'

// 取得總部商店 ID
async function getHQStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('tenants')
        .select('id, slug')
        .or(`slug.eq.hq,managed_by.eq.${userId}`)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    return data
}

export default async function AdminPagesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const hqStore = await getHQStoreId(supabase, user.id)

    if (!hqStore) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-serif font-bold text-foreground">頁面管理</h1>
                <div className="bg-card rounded-xl border border-border p-12 text-center shadow-soft">
                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-6">尚未建立總部商店</p>
                    <Link href="/admin/stores/new">
                        <Button className="shadow-soft">建立總部商店</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const { data: pages } = await supabase
        .from('pages')
        .select('*')
        .eq('tenant_id', hqStore.id)
        .order('is_homepage', { ascending: false })
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-foreground">頁面管理</h1>
                <Link href="/admin/pages/new">
                    <Button className="gap-2 shadow-soft">
                        <Plus className="h-4 w-4" />
                        新增頁面
                    </Button>
                </Link>
            </div>

            <PageList
                pages={pages || []}
                basePath="/admin/pages"
                storeSlug={hqStore.slug}
                deleteAction={deletePage}
            />
        </div>
    )
}
