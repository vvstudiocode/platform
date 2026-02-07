'use server'

import { getCurrentTenant } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import * as sharedPages from '@/features/pages/actions'

export async function createPage(prevState: any, formData: FormData) {
    const tenant = await getCurrentTenant('app')
    if (!tenant) return { error: '請先登入' }

    // App 自動創建導覽項目
    return sharedPages.createPage(tenant.id, '/app/pages', true, prevState, formData)
}

export async function updatePage(pageId: string, prevState: any, formData: FormData) {
    const tenant = await getCurrentTenant('app')
    if (!tenant) return { error: '請先登入' }

    const result = await sharedPages.updatePage(tenant.id, pageId, true, prevState, formData)

    if (result.success) {
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()

        const { data: page } = await supabase
            .from('pages')
            .select('slug')
            .eq('id', pageId)
            .single()

        revalidatePath('/app/pages')
        revalidatePath(`/app/pages/${pageId}`)

        if (tenant.slug && page?.slug) {
            revalidatePath(`/store/${tenant.slug}`)
            revalidatePath(`/store/${tenant.slug}/${page.slug}`)
        }
    }

    return result
}

export async function updatePageContent(pageId: string, content: any[]) {
    const tenant = await getCurrentTenant('app')
    if (!tenant) return { error: '請先登入' }

    const result = await sharedPages.updatePageContent(tenant.id, pageId, content)

    if (result.success) {
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()

        const { data: page } = await supabase
            .from('pages')
            .select('slug')
            .eq('id', pageId)
            .single()

        revalidatePath('/app/pages')
        revalidatePath(`/app/pages/${pageId}`)

        if (tenant.slug && page?.slug) {
            revalidatePath(`/store/${tenant.slug}`)
            revalidatePath(`/store/${tenant.slug}/${page.slug}`)
        }
    }

    return result
}

export async function deletePage(pageId: string) {
    const tenant = await getCurrentTenant('app')
    if (!tenant) return { error: '請先登入' }

    // App 需要保護首頁和最後一頁
    const result = await sharedPages.deletePage(tenant.id, pageId, true)

    if (result.success) {
        revalidatePath('/app/pages')
    }

    return result
}
