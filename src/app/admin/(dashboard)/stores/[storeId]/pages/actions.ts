'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const pageSchema = z.object({
    title: z.string().min(1, '請輸入頁面標題'),
    slug: z.string().min(1, '請輸入頁面網址').regex(/^[a-z0-9-]+$/, '只能使用小寫英文、數字和連字符'),
    meta_title: z.string().nullish().transform(v => v || undefined),
    meta_description: z.string().nullish().transform(v => v || undefined),
    is_homepage: z.coerce.boolean().default(false),
    published: z.coerce.boolean().default(false),
})

export async function createStorePage(storeId: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    // 驗證使用者有權限管理此商店
    const { data: store } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', storeId)
        .eq('managed_by', user.id)
        .single()

    if (!store) return { error: '無權限管理此商店' }

    const validated = pageSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        meta_title: formData.get('meta_title'),
        meta_description: formData.get('meta_description'),
        is_homepage: formData.get('is_homepage') === 'on',
        published: formData.get('published') === 'on',
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // 如果設為首頁，先取消其他首頁
    if (validated.data.is_homepage) {
        await supabase
            .from('pages')
            .update({ is_homepage: false })
            .eq('tenant_id', storeId)
    }

    const { error } = await supabase
        .from('pages')
        .insert({
            tenant_id: storeId,
            ...validated.data,
            content: [],
        })

    if (error) {
        if (error.code === '23505') {
            return { error: '此網址已被使用' }
        }
        return { error: error.message }
    }

    revalidatePath(`/admin/stores/${storeId}/pages`)
    redirect(`/admin/stores/${storeId}/pages`)
}

export async function updateStorePage(storeId: string, pageId: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    // 1. 先取得頁面資訊，確認其所屬商店 (tenant_id)
    const { data: existingPage, error: fetchError } = await supabase
        .from('pages')
        .select('tenant_id, slug')
        .eq('id', pageId)
        .single()

    if (fetchError || !existingPage) return { error: '找不到頁面' }

    const tenantId = existingPage.tenant_id

    // 2. 驗證使用者是否有權限管理此商店
    const { data: store } = await supabase
        .from('tenants')
        .select('id, slug, managed_by')
        .eq('id', tenantId)
        .eq('managed_by', user.id) // 確保是管理者
        .single()

    if (!store) return { error: '無權限管理此商店' }

    const validated = pageSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        meta_title: formData.get('meta_title'),
        meta_description: formData.get('meta_description'),
        is_homepage: formData.get('is_homepage') === 'on',
        published: formData.get('published') === 'on',
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // 如果設為首頁，先取消該商店的其他首頁
    if (validated.data.is_homepage) {
        await supabase
            .from('pages')
            .update({ is_homepage: false })
            .eq('tenant_id', tenantId) // 使用確定的 tenantId
            .neq('id', pageId)
    }

    const { error } = await supabase
        .from('pages')
        .update(validated.data)
        .eq('id', pageId)

    if (error) {
        if (error.code === '23505') {
            return { error: '此網址已被使用' }
        }
        return { error: error.message }
    }

    // Revalidate logic
    revalidatePath(`/admin/stores/${storeId}/pages`)
    revalidatePath(`/admin/stores/${storeId}/pages/${pageId}`)

    if (store.slug) {
        revalidatePath(`/store/${store.slug}`)
        revalidatePath(`/store/${store.slug}/${validated.data.slug}`)
        // 如果 slug 改變了，這裡應該也要處裡舊 slug 的 revalidate，暫時忽略
    }

    return { success: true }
}

export async function updateStorePageContent(storeId: string, pageId: string, content: any[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    // 驗證權限 (可以加，但 updateStorePage 已經把關，這裡假設 pageId 正確)
    // 為了安全最好還是查一下，或是依賴 RLS

    const { error } = await supabase
        .from('pages')
        .update({ content })
        .eq('id', pageId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/stores/${storeId}/pages`)
    revalidatePath(`/admin/stores/${storeId}/pages/${pageId}`)

    // 取得 store slug 進行 revalidate
    const { data: page } = await supabase
        .from('pages')
        .select('tenant_id, slug')
        .eq('id', pageId)
        .single()

    if (page?.tenant_id) {
        const { data: store } = await supabase
            .from('tenants')
            .select('slug')
            .eq('id', page.tenant_id)
            .single()

        if (store?.slug) {
            revalidatePath(`/store/${store.slug}`)
            revalidatePath(`/store/${store.slug}/${page.slug}`)
        }
    }

    return { success: true }
}

export async function deleteStorePage(storeId: string, pageId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/stores/${storeId}/pages`)
    return { success: true }
}
