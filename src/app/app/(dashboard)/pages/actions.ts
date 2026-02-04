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
        meta_title: formData.get('meta_title'),
        meta_description: formData.get('meta_description'),
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
        meta_title: formData.get('meta_title'),
        meta_description: formData.get('meta_description'),
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
