'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const productSchema = z.object({
    name: z.string().min(1, '請輸入商品名稱'),
    description: z.string().nullish().transform(v => v || undefined),
    brand: z.string().nullish().transform(v => v || undefined),
    category: z.string().nullish().transform(v => v || undefined),
    price: z.coerce.number().min(0, '價格不能為負數'),
    cost: z.coerce.number().min(0).nullish().transform(v => v ?? undefined),
    price_krw: z.coerce.number().min(0).nullish().transform(v => v ?? undefined),
    stock: z.coerce.number().min(0).default(0),
    sku: z.string().nullish().transform(v => v || undefined),
    image_url: z.string().nullish().transform(v => v || undefined),
    status: z.enum(['draft', 'active', 'archived']).default('draft'),
    // SEO 欄位
    seo_title: z.string().nullish().transform(v => v || undefined),
    seo_description: z.string().nullish().transform(v => v || undefined),
    seo_keywords: z.string().nullish().transform(v => v || undefined),
})

// 取得總部商店 ID
// 取得總部商店 ID
async function getHQStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('tenants')
        .select('id')
        .eq('managed_by', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    return data?.id
}

export async function createProduct(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const hqStoreId = await getHQStoreId(supabase, user.id)
    if (!hqStoreId) return { error: '找不到總部商店' }

    const validated = productSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        brand: formData.get('brand'),
        category: formData.get('category'),
        price: formData.get('price'),
        cost: formData.get('cost'),
        price_krw: formData.get('price_krw'),
        stock: formData.get('stock'),
        sku: formData.get('sku'),
        image_url: formData.get('image_url'),
        status: formData.get('status'),
        // SEO 欄位
        seo_title: formData.get('seo_title'),
        seo_description: formData.get('seo_description'),
        seo_keywords: formData.get('seo_keywords'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // 如果沒有輸入 SKU，自動生成
    let sku = validated.data.sku
    if (!sku || sku.trim() === '') {
        sku = await generateSKU(supabase, hqStoreId)
    }

    // 自動儲存品牌與分類 (如果不存在)
    if (validated.data.brand) {
        await supabase
            .from('brands')
            .upsert({ tenant_id: hqStoreId, name: validated.data.brand }, { onConflict: 'tenant_id, name', ignoreDuplicates: true })
    }

    if (validated.data.category) {
        await supabase
            .from('categories')
            .upsert({ tenant_id: hqStoreId, name: validated.data.category }, { onConflict: 'tenant_id, name', ignoreDuplicates: true })
    }

    const { error } = await supabase
        .from('products')
        .insert({
            tenant_id: hqStoreId,
            ...validated.data,
            sku,
            image_url: validated.data.image_url || null,
            seo_title: validated.data.seo_title || null,
            seo_description: validated.data.seo_description || null,
            seo_keywords: validated.data.seo_keywords || null,
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function updateProduct(productId: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const validated = productSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        brand: formData.get('brand'),
        category: formData.get('category'),
        price: formData.get('price'),
        cost: formData.get('cost'),
        price_krw: formData.get('price_krw'),
        stock: formData.get('stock'),
        sku: formData.get('sku'),
        image_url: formData.get('image_url'),
        status: formData.get('status'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // Get HQ Store ID for attribute saving
    const hqStoreId = await getHQStoreId(supabase, user.id)
    if (hqStoreId) {
        // 自動儲存品牌與分類 (如果不存在)
        if (validated.data.brand) {
            await supabase
                .from('brands')
                .upsert({ tenant_id: hqStoreId, name: validated.data.brand }, { onConflict: 'tenant_id, name', ignoreDuplicates: true })
        }

        if (validated.data.category) {
            await supabase
                .from('categories')
                .upsert({ tenant_id: hqStoreId, name: validated.data.category }, { onConflict: 'tenant_id, name', ignoreDuplicates: true })
        }
    }

    const { error } = await supabase
        .from('products')
        .update({
            ...validated.data,
            image_url: validated.data.image_url || null,
        })
        .eq('id', productId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function deleteProduct(productId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/products')
    return { success: true }
}

// 更新商品上下架狀態
export async function updateProductStatus(productId: string, status: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', productId)

    if (error) {
        return { error: error.message }
    }

    // 不使用 revalidatePath 避免 Turbopack header 錯誤
    return { success: true }
}

// 更新商品排序
export async function updateProductOrder(orderData: { id: string; order: number }[]) {
    const supabase = await createClient()

    // 批次更新排序
    for (const item of orderData) {
        await supabase
            .from('products')
            .update({ sort_order: item.order })
            .eq('id', item.id)
    }

    // 不使用 revalidatePath 避免 Turbopack header 錯誤
    return { success: true }
}

// 自動生成商品編號
export async function generateSKU(supabase: any, tenantId: string): Promise<string> {
    // 取得目前最大編號
    const { data } = await supabase
        .from('products')
        .select('sku')
        .eq('tenant_id', tenantId)
        .not('sku', 'is', null)
        .order('sku', { ascending: false })
        .limit(1)
        .single()

    let nextNum = 1
    if (data?.sku) {
        const match = data.sku.match(/P(\d+)/)
        if (match) {
            nextNum = parseInt(match[1]) + 1
        }
    }

    return `P${String(nextNum).padStart(6, '0')}`
}
