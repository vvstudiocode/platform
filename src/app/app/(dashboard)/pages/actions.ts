'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const pageSchema = z.object({
    title: z.string().min(1, '請輸入頁面標題'),
    slug: z.string().min(1, '請輸入頁面網址').regex(/^[a-z0-9-]+$/, '只能使用小寫英文、數字和連字符'),
    seo_title: z.string().nullish().transform(v => v || undefined),
    seo_description: z.string().nullish().transform(v => v || undefined),
    seo_keywords: z.string().nullish().transform(v => v || undefined),
    background_color: z.string().nullish().transform(v => v || undefined),
    is_homepage: z.coerce.boolean().default(false),
    published: z.coerce.boolean().default(false),
})

async function getUserStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return data?.tenant_id
}

export async function createPage(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const storeId = await getUserStoreId(supabase, user.id)
    if (!storeId) return { error: '找不到商店' }

    const validated = pageSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        seo_title: formData.get('seo_title'),
        seo_description: formData.get('seo_description'),
        seo_keywords: formData.get('seo_keywords'),
        background_color: formData.get('background_color'),
        is_homepage: formData.get('is_homepage') === 'on',
        published: formData.get('published') === 'on',
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    if (validated.data.is_homepage) {
        await supabase
            .from('pages')
            .update({ is_homepage: false })
            .eq('tenant_id', storeId)
    }

    const { data, error } = await supabase
        .from('pages')
        .insert({
            tenant_id: storeId,
            ...validated.data,
            content: [],
        })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            return { error: '此網址已被使用' }
        }
        return { error: error.message }
    }

    if (data) {
        // 自動建立導覽列項目 (Auto-create nav item)
        const { data: maxPosData } = await supabase
            .from('nav_items')
            .select('position')
            .eq('tenant_id', storeId)
            .order('position', { ascending: false })
            .limit(1)
            .single()

        const nextPos = (maxPosData?.position || 0) + 1

        await supabase.from('nav_items').insert({
            tenant_id: storeId,
            title: validated.data.title,
            page_id: data.id,
            position: nextPos,
            parent_id: null
        })
    }

    revalidatePath('/app/pages')
    redirect('/app/pages')
}

export async function updatePage(pageId: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const storeId = await getUserStoreId(supabase, user.id)
    if (!storeId) return { error: '找不到商店' }

    const validated = pageSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        seo_title: formData.get('seo_title'),
        seo_description: formData.get('seo_description'),
        seo_keywords: formData.get('seo_keywords'),
        background_color: formData.get('background_color'),
        is_homepage: formData.get('is_homepage') === 'on',
        published: formData.get('published') === 'on',
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    console.log('Updating page with data:', validated.data)

    if (validated.data.is_homepage) {
        await supabase
            .from('pages')
            .update({ is_homepage: false })
            .eq('tenant_id', storeId)
            .neq('id', pageId)
    }

    const { data: tenant } = await supabase
        .from('tenants')
        .select('slug')
        .eq('id', storeId)
        .single()

    const { error } = await supabase
        .from('pages')
        .update(validated.data)
        .eq('id', pageId)

    if (!error) {
        // 同步更新導覽列項目標題
        await supabase
            .from('nav_items')
            .update({ title: validated.data.title })
            .eq('page_id', pageId)
    }

    if (error) {
        if (error.code === '23505') {
            return { error: '此網址已被使用' }
        }
        return { error: error.message }
    }

    revalidatePath('/app/pages')
    revalidatePath(`/app/pages/${pageId}`)
    if (tenant?.slug) {
        revalidatePath(`/store/${tenant.slug}`)
        revalidatePath(`/store/${tenant.slug}/${validated.data.slug}`)
    }

    return { success: true }
}

export async function updatePageContent(pageId: string, content: any[]) {
    const supabase = await createClient()

    // 取得頁面資訊以進行重驗證
    const { data: page } = await supabase
        .from('pages')
        .select('slug, tenant_id')
        .eq('id', pageId)
        .single()

    const { error } = await supabase
        .from('pages')
        .update({ content })
        .eq('id', pageId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/app/pages')
    revalidatePath(`/app/pages/${pageId}`)

    if (page?.tenant_id) {
        const { data: tenant } = await supabase
            .from('tenants')
            .select('slug')
            .eq('id', page.tenant_id)
            .single()

        if (tenant?.slug) {
            revalidatePath(`/store/${tenant.slug}`)
            revalidatePath(`/store/${tenant.slug}/${page.slug}`)
        }
    }

    return { success: true }
}

export async function deletePage(pageId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const storeId = await getUserStoreId(supabase, user.id)
    if (!storeId) return { error: '找不到商店' }

    // 檢查是否為首頁
    const { data: page } = await supabase
        .from('pages')
        .select('is_homepage')
        .eq('id', pageId)
        .single()

    if (page?.is_homepage) {
        return { error: '不能刪除首頁' }
    }

    // 檢查是否為最後一頁
    const { count } = await supabase
        .from('pages')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', storeId)

    if (count !== null && count <= 1) {
        return { error: '商店必須至少保留一個頁面' }
    }

    const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId)
        .eq('tenant_id', storeId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/app/pages')
    return { success: true }
}
