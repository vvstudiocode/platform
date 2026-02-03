import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { PageEditForm } from './page-edit-form'
import { updatePage } from '../actions'

interface Props {
    params: Promise<{ pageId: string }>
}

export default async function EditPagePage({ params }: Props) {
    const { pageId } = await params
    const supabase = await createClient()
    const cookieStore = await cookies()

    // 取得 tenant_id
    const tenantId = cookieStore.get('tenant_id')?.value

    // 取得商店 slug
    let storeSlug: string | undefined
    if (tenantId) {
        const { data: tenant } = await supabase
            .from('tenants')
            .select('slug')
            .eq('id', tenantId)
            .single()
        storeSlug = tenant?.slug
    }

    const { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single()

    if (!page) {
        notFound()
    }

    const boundUpdatePage = updatePage.bind(null, pageId)

    return (
        <PageEditForm
            page={{
                id: page.id,
                title: page.title,
                slug: page.slug,
                is_homepage: page.is_homepage,
                published: page.published,
                show_in_nav: page.show_in_nav ?? false,
                nav_order: page.nav_order ?? 0,
                content: (page.content as any[]) || [],
            }}
            updateAction={boundUpdatePage}
            storeSlug={storeSlug}
            tenantId={tenantId}
        />
    )
}

