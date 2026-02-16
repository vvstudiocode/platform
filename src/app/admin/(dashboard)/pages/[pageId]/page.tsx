import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PageEditForm } from '@/features/page-editor/page-edit-form'
import { updatePage, updatePageContent } from '../actions'

interface Props {
    params: Promise<{ pageId: string }>
}

export default async function EditPagePage({ params }: Props) {
    const { pageId } = await params
    const supabase = await createClient()

    const { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single()

    if (!page) {
        notFound()
    }

    const { data: tenant } = await supabase
        .from('tenants')
        .select('name, slug, footer_settings')
        .eq('id', page.tenant_id || '')
        .single()

    // Mock subscription plan until DB is ready
    const subscriptionPlan: 'free' | 'growth' = 'free'

    const boundUpdatePage = updatePage.bind(null, pageId)

    return (
        <PageEditForm
            key={JSON.stringify(page.content)}
            page={{
                id: page.id,
                title: page.title,
                slug: page.slug,
                is_homepage: page.is_homepage || false,
                published: page.published || false,
                show_in_nav: page.show_in_nav ?? false,
                nav_order: page.nav_order ?? 0,
                background_color: page.background_color || '',
                seo_title: page.seo_title || '',
                seo_description: page.seo_description || '',
                seo_keywords: page.seo_keywords || '',
                content: (page.content as any[]) || [],
            }}
            updateAction={boundUpdatePage}
            updatePageContentAction={updatePageContent}
            basePath="/admin/pages"
            tenantId={page.tenant_id || ''}
            storeSlug={tenant?.slug}
            storeName={tenant?.name}
            footerSettings={tenant?.footer_settings}
            subscriptionPlan={subscriptionPlan}
        />
    )
}
