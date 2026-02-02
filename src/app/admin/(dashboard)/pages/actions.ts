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
    show_in_nav: z.coerce.boolean().default(false),
    nav_order: z.coerce.number().default(0),
})

// 取得總部商店 ID
async function getHQStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('tenants')
        .select('id')
        .or(`slug.eq.hq,managed_by.eq.${userId}`)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    return data?.id
}

export async function createPage(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const hqStoreId = await getHQStoreId(supabase, user.id)
    if (!hqStoreId) return { error: '找不到總部商店' }

    const validated = pageSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        meta_title: formData.get('meta_title'),
        meta_description: formData.get('meta_description'),
        is_homepage: formData.get('is_homepage') === 'on',
        published: formData.get('published') === 'on',
        show_in_nav: formData.get('show_in_nav') === 'on',
        nav_order: formData.get('nav_order') || 0,
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // 如果設為首頁，先取消其他首頁
    if (validated.data.is_homepage) {
        await supabase
            .from('pages')
            .update({ is_homepage: false })
            .eq('tenant_id', hqStoreId)
    }

    const { error } = await supabase
        .from('pages')
        .insert({
            tenant_id: hqStoreId,
            ...validated.data,
            content: [],
        })

    if (error) {
        if (error.code === '23505') {
            return { error: '此網址已被使用' }
        }
        return { error: error.message }
    }

    revalidatePath('/admin/pages')
    redirect('/admin/pages')
}

export async function updatePage(pageId: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const hqStoreId = await getHQStoreId(supabase, user.id)
    if (!hqStoreId) return { error: '找不到總部商店' }

    const validated = pageSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        meta_title: formData.get('meta_title'),
        meta_description: formData.get('meta_description'),
        is_homepage: formData.get('is_homepage') === 'on',
        published: formData.get('published') === 'on',
        show_in_nav: formData.get('show_in_nav') === 'on',
        nav_order: formData.get('nav_order') || 0,
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // 如果設為首頁，先取消其他首頁
    if (validated.data.is_homepage) {
        await supabase
            .from('pages')
            .update({ is_homepage: false })
            .eq('tenant_id', hqStoreId)
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

    revalidatePath('/admin/pages')
    redirect('/admin/pages')
}

export async function updatePageContent(pageId: string, content: any[]) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('pages')
        .update({ content })
        .eq('id', pageId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/pages')
    return { success: true }
}

export async function deletePage(pageId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/pages')
    return { success: true }
}
