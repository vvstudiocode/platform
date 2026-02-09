import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PagesPage } from '@/features/pages/pages-page'
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
            <PagesPage
                pages={[]}
                basePath="/admin/pages"
                storeSlug=""
                deleteAction={deletePage}
                emptyState={{
                    message: '尚未建立總部商店',
                    actionLabel: '建立總部商店',
                    actionHref: '/admin/stores/new'
                }}
            />
        )
    }

    const { data: pages } = await supabase
        .from('pages')
        .select('id, title, slug, is_homepage, published, updated_at')
        .eq('tenant_id', hqStore.id)
        .order('is_homepage', { ascending: false })
        .order('created_at', { ascending: true })

    return (
        <PagesPage
            pages={pages || []}
            basePath="/admin/pages"
            storeSlug={hqStore.slug}
            deleteAction={deletePage}
        />
    )
}
