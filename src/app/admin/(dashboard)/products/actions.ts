'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const productSchema = z.object({
    name: z.string().min(1, '請輸入商品名稱'),
    description: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    price: z.coerce.number().min(0, '價格不能為負數'),
    cost: z.coerce.number().min(0).optional(),
    price_krw: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().min(0).default(0),
    sku: z.string().optional(),
    image_url: z.string().url().optional().or(z.literal('')),
    status: z.enum(['draft', 'active', 'archived']).default('draft'),
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
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const { error } = await supabase
        .from('products')
        .insert({
            tenant_id: hqStoreId,
            ...validated.data,
            image_url: validated.data.image_url || null,
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
