import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StorePageEditForm } from './store-page-edit-form'
import { updateStorePage } from '../actions'

interface Props {
    params: Promise<{ storeId: string; pageId: string }>
}

export default async function EditStorePagePage({ params }: Props) {
    const { storeId, pageId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 驗證權限
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('id', storeId)
        .eq('managed_by', user?.id || '')
        .single()

    if (!store) {
        notFound()
    }

    const { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .eq('tenant_id', storeId)
        .single()

    if (!page) {
        notFound()
    }

    const boundUpdatePage = updateStorePage.bind(null, storeId, pageId)

    return (
        <StorePageEditForm
            storeId={storeId}
            storeName={store.name}
            storeSlug={store.slug}
            page={{
                id: page.id,
                title: page.title,
                slug: page.slug,
                is_homepage: page.is_homepage || false,
                published: page.published || false,
                content: (page.content as any[]) || [],
            }}
            updateAction={boundUpdatePage}
        />
    )
}
