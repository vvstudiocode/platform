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

    revalidatePath(`/admin/stores/${storeId}/pages`)
    redirect(`/admin/stores/${storeId}/pages`)
}

export async function updateStorePageContent(storeId: string, pageId: string, content: any[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const { error } = await supabase
        .from('pages')
        .update({ content })
        .eq('id', pageId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/stores/${storeId}/pages`)
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
