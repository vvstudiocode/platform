import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PageEditForm } from './page-edit-form'
import { updatePage } from '../actions'

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

    const boundUpdatePage = updatePage.bind(null, pageId)

    return (
        <PageEditForm
            page={{
                id: page.id,
                title: page.title,
                slug: page.slug,
                is_homepage: page.is_homepage,
                published: page.published,
                content: (page.content as any[]) || [],
            }}
            updateAction={boundUpdatePage}
        />
    )
}
