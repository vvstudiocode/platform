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

    // 1. 先取得頁面資料
    const { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single()

    if (!page) {
        notFound()
    }

    // 2. 決定 tenant_id (優先使用 cookie，若無則使用頁面的 tenant_id)
    const cookieTenantId = cookieStore.get('tenant_id')?.value
    const tenantId = cookieTenantId || page.tenant_id

    // 3. 取得商店 slug
    let storeSlug: string | undefined
    let storeName: string | undefined
    let footerSettings: any

    if (tenantId) {
        const { data: tenant } = await supabase
            .from('tenants')
            .select('slug, name, footer_settings')
            .eq('id', tenantId)
            .single()
        storeSlug = tenant?.slug
        storeName = tenant?.name
        footerSettings = tenant?.footer_settings
    }

    const boundUpdatePage = updatePage.bind(null, pageId)

    return (
        <PageEditForm
            page={{
                id: page.id,
                title: page.title,
                slug: page.slug,
                is_homepage: page.is_homepage || false,
                published: page.published || false,
                show_in_nav: page.show_in_nav ?? false,
                nav_order: page.nav_order ?? 0,
                background_color: page.background_color || undefined,
                seo_title: page.seo_title || undefined,
                seo_description: page.seo_description || undefined,
                seo_keywords: page.seo_keywords || undefined,
                content: (page.content as any[]) || [],
            }}
            updateAction={boundUpdatePage}
            storeSlug={storeSlug}
            storeName={storeName}
            footerSettings={footerSettings}
            tenantId={tenantId || ''}
        />
    )
}

