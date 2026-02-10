'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { verifyTenantAccess } from '@/lib/tenant'
import { z } from 'zod'

const RESERVED_SLUGS = [
    'admin', 'app', 'api', 'store',
    'product', 'products',
    'cart', 'checkout',
    'login', 'register', 'auth',
    'settings', 'home',
    'search',
    'collection', 'collections',
    'category', 'categories',
    'blog', 'account',
    'order', 'orders',
    'public', 'static'
]

const pageSchema = z.object({
    title: z.string().min(1, '請輸入頁面標題'),
    slug: z.string()
        .regex(/^[a-z0-9-]*$/, '只能使用小寫英文、數字和連字符')
        .refine(slug => !RESERVED_SLUGS.includes(slug.toLowerCase()), {
            message: "此網址為系統保留字，請使用其他名稱"
        }),
    seo_title: z.string().nullish().transform(v => v || undefined),
    seo_description: z.string().nullish().transform(v => v || undefined),
    seo_keywords: z.string().nullish().transform(v => v || undefined),
    background_color: z.string().nullish().transform(v => v || undefined),
    is_homepage: z.coerce.boolean().default(false),
    published: z.coerce.boolean().default(false),
    show_in_nav: z.coerce.boolean().default(false),
    nav_order: z.coerce.number().default(0),
}).superRefine((data, ctx) => {
    if (!data.is_homepage && !data.slug) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "請輸入頁面網址",
            path: ["slug"]
        })
    }
})

export async function createPage(
    tenantId: string,
    redirectPath: string,
    createNavItem: boolean,
    prevState: any,
    formData: FormData
) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    const validated = pageSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        seo_title: formData.get('seo_title'),
        seo_description: formData.get('seo_description'),
        seo_keywords: formData.get('seo_keywords'),
        background_color: formData.get('background_color'),
        is_homepage: formData.get('is_homepage') === 'on',
        published: formData.get('published') === 'on',
        show_in_nav: formData.get('show_in_nav') === 'on',
        nav_order: formData.get('nav_order') || 0,
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // 如果是首頁，強制清除 slug
    const pageData = { ...validated.data }
    if (pageData.is_homepage) {
        pageData.slug = ''
    }

    // 如果設為首頁，先取消其他首頁
    if (pageData.is_homepage) {
        await supabase
            .from('pages')
            .update({ is_homepage: false })
            .eq('tenant_id', tenantId)
    }

    const { data, error } = await supabase
        .from('pages')
        .insert({
            tenant_id: tenantId,
            ...pageData,
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

    // 自動建立導覽列項目（僅限 App/子網站）
    if (createNavItem && data) {
        const { data: maxPosData } = await supabase
            .from('nav_items')
            .select('position')
            .eq('tenant_id', tenantId)
            .order('position', { ascending: false })
            .limit(1)
            .single()

        const nextPos = (maxPosData?.position || 0) + 1

        await supabase.from('nav_items').insert({
            tenant_id: tenantId,
            title: pageData.title,
            page_id: data.id,
            position: nextPos,
            parent_id: null
        })
    }

    revalidatePath(redirectPath)
    redirect(redirectPath)
}

export async function updatePage(
    tenantId: string,
    pageId: string,
    updateNavTitle: boolean,
    prevState: any,
    formData: FormData
) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    const validated = pageSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        seo_title: formData.get('seo_title'),
        seo_description: formData.get('seo_description'),
        seo_keywords: formData.get('seo_keywords'),
        background_color: formData.get('background_color'),
        is_homepage: formData.get('is_homepage') === 'on',
        published: formData.get('published') === 'on',
        show_in_nav: formData.get('show_in_nav') === 'on',
        nav_order: formData.get('nav_order') || 0,
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // 如果是首頁，強制清除 slug
    const pageData = { ...validated.data }
    if (pageData.is_homepage) {
        pageData.slug = ''
    }

    // 如果設為首頁，先取消該商店的其他首頁
    if (pageData.is_homepage) {
        await supabase
            .from('pages')
            .update({ is_homepage: false })
            .eq('tenant_id', tenantId)
            .neq('id', pageId)
    }

    const { error } = await supabase
        .from('pages')
        .update(pageData)
        .eq('id', pageId)
        .eq('tenant_id', tenantId)

    if (error) {
        if (error.code === '23505') {
            return { error: '此網址已被使用' }
        }
        return { error: error.message }
    }

    // 同步更新導覽列項目標題（僅限 App/子網站）
    if (updateNavTitle) {
        await supabase
            .from('nav_items')
            .update({ title: validated.data.title })
            .eq('page_id', pageId)
            .eq('tenant_id', tenantId)
    }

    return { success: true }
}

export async function updatePageContent(tenantId: string, pageId: string, content: any[]) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('pages')
        .update({ content })
        .eq('id', pageId)
        .eq('tenant_id', tenantId)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function deletePage(tenantId: string, pageId: string, preventHomepage: boolean = true) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    // 檢查是否為首頁（子網站限制）
    if (preventHomepage) {
        const { data: page } = await supabase
            .from('pages')
            .select('is_homepage')
            .eq('id', pageId)
            .eq('tenant_id', tenantId)
            .single()

        if (page?.is_homepage) {
            return { error: '不能刪除首頁' }
        }

        // 檢查是否為最後一頁
        const { count } = await supabase
            .from('pages')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)

        if (count !== null && count <= 1) {
            return { error: '商店必須至少保留一個頁面' }
        }
    }

    const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId)
        .eq('tenant_id', tenantId)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
