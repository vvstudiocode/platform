import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PagesPage } from '@/features/pages/pages-page'
import { deletePage } from './actions'

async function getUserStore(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id, tenants:tenant_id(id, slug)')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return data?.tenants as any
}

export default async function AppPagesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/app/login')

    const store = await getUserStore(supabase, user.id)
    if (!store) redirect('/app/onboarding')

    const { data: pages } = await supabase
        .from('pages')
        .select('id, title, slug, is_homepage, published, updated_at')
        .eq('tenant_id', store.id)
        .order('is_homepage', { ascending: false })
        .order('created_at', { ascending: true })

    return (
        <PagesPage
            pages={pages || []}
            basePath="/app/pages"
            storeSlug={store.slug}
            deleteAction={deletePage}
        />
    )
}
