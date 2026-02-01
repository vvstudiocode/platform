'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
    name: z.string().min(1, '請輸入商品名稱'),
    description: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    price: z.coerce.number().min(0, '價格必須為正數'),
    cost: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().min(0, '庫存必須為正數'),
    priceKrw: z.coerce.number().min(0).optional(),
    sku: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    status: z.enum(['draft', 'active', 'archived']).default('draft'),
})

export async function createProduct(prevState: { error: string }, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: '未登入' }
    }

    const storeId = formData.get('storeId') as string
    if (!storeId) {
        return { error: '缺少商店 ID' }
    }

    // 驗證使用者有權管理此商店
    const { data: store } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', storeId)
        .eq('managed_by', user.id)
        .single()

    if (!store) {
        return { error: '無權管理此商店' }
    }

    // 驗證輸入
    const validated = schema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        brand: formData.get('brand'),
        category: formData.get('category'),
        price: formData.get('price'),
        cost: formData.get('cost'),
        stock: formData.get('stock'),
        priceKrw: formData.get('priceKrw'),
        sku: formData.get('sku'),
        imageUrl: formData.get('imageUrl'),
        status: formData.get('status'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const data = validated.data

    // 建立商品
    const { error: productError } = await supabase
        .from('products')
        .insert({
            tenant_id: storeId,
            name: data.name,
            description: data.description || null,
            brand: data.brand || null,
            category: data.category || null,
            price: data.price,
            cost: data.cost || 0,
            stock: data.stock,
            price_krw: data.priceKrw || 0,
            sku: data.sku || null,
            image_url: data.imageUrl || null,
            status: data.status,
        })

    if (productError) {
        return { error: productError.message }
    }

    revalidatePath(`/admin/stores/${storeId}/products`)
    redirect(`/admin/stores/${storeId}/products`)
}

export async function updateProduct(prevState: { error: string }, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: '未登入' }
    }

    const storeId = formData.get('storeId') as string
    const productId = formData.get('productId') as string

    if (!storeId || !productId) {
        return { error: '缺少必要參數' }
    }

    // 驗證輸入
    const validated = schema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        brand: formData.get('brand'),
        category: formData.get('category'),
        price: formData.get('price'),
        cost: formData.get('cost'),
        stock: formData.get('stock'),
        priceKrw: formData.get('priceKrw'),
        sku: formData.get('sku'),
        imageUrl: formData.get('imageUrl'),
        status: formData.get('status'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const data = validated.data

    // 更新商品
    const { error: productError } = await supabase
        .from('products')
        .update({
            name: data.name,
            description: data.description || null,
            brand: data.brand || null,
            category: data.category || null,
            price: data.price,
            cost: data.cost || 0,
            stock: data.stock,
            price_krw: data.priceKrw || 0,
            sku: data.sku || null,
            image_url: data.imageUrl || null,
            status: data.status,
        })
        .eq('id', productId)
        .eq('tenant_id', storeId)

    if (productError) {
        return { error: productError.message }
    }

    revalidatePath(`/admin/stores/${storeId}/products`)
    redirect(`/admin/stores/${storeId}/products`)
}

export async function deleteProduct(storeId: string, productId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: '未登入' }
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('tenant_id', storeId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/stores/${storeId}/products`)
    return { success: true }
}
