'use server'

import { getCurrentTenant } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import * as sharedPages from '@/features/pages/actions'

export async function createPage(prevState: any, formData: FormData) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: '請先登入' }

    // Admin 不自動創建導覽項目
    return sharedPages.createPage(tenant.id, '/admin/pages', false, prevState, formData)
}

export async function updatePage(pageId: string, prevState: any, formData: FormData) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: '請先登入' }

    const result = await sharedPages.updatePage(tenant.id, pageId, true, prevState, formData)

    if (result.success) {
        // 獲取頁面資訊進行 revalidate
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()

        const { data: page } = await supabase
            .from('pages')
            .select('slug')
            .eq('id', pageId)
            .single()

        const { data: tenantData } = await supabase
            .from('tenants')
            .select('slug')
            .eq('id', tenant.id)
            .single()

        revalidatePath('/admin/pages')
        revalidatePath(`/admin/pages/${pageId}`)

        if (tenantData?.slug && page?.slug) {
            revalidatePath(`/store/${tenantData.slug}`)
            revalidatePath(`/store/${tenantData.slug}/${page.slug}`)
        }
    }

    return result
}

export async function updatePageContent(pageId: string, content: any[]) {
    const tenant = await getCurrentTenant('admin')
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

        const { data: tenantData } = await supabase
            .from('tenants')
            .select('slug')
            .eq('id', tenant.id)
            .single()

        revalidatePath('/admin/pages')
        revalidatePath(`/admin/pages/${pageId}`)

        if (tenantData?.slug && page?.slug) {
            revalidatePath(`/store/${tenantData.slug}`)
            revalidatePath(`/store/${tenantData.slug}/${page.slug}`)
        }
    }

    return result
}

export async function deletePage(pageId: string) {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return { error: '請先登入' }

    // Admin 可以刪除首頁和最後一頁
    const result = await sharedPages.deletePage(tenant.id, pageId, false)

    if (result.success) {
        revalidatePath('/admin/pages')
    }

    return result
}
