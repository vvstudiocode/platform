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
    priceKrw: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().min(0).default(0),
    sku: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    status: z.enum(['draft', 'active', 'archived']).default('draft'),
})

export async function createProduct(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Please login' }

    const storeId = formData.get('storeId') as string
    if (!storeId) return { error: 'Store ID is required' }

    // 驗證用戶有權限管理此商店
    const { data: store } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', storeId)
        .single()

    if (!store) return { error: 'Store not found' }

    const validated = productSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        brand: formData.get('brand'),
        category: formData.get('category'),
        price: formData.get('price'),
        cost: formData.get('cost'),
        priceKrw: formData.get('priceKrw'),
        stock: formData.get('stock'),
        sku: formData.get('sku'),
        imageUrl: formData.get('imageUrl'),
        status: formData.get('status'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const { error } = await supabase
        .from('products')
        .insert({
            tenant_id: storeId,
            name: validated.data.name,
            description: validated.data.description || null,
            brand: validated.data.brand || null,
            category: validated.data.category || null,
            price: validated.data.price,
            cost: validated.data.cost || null,
            price_krw: validated.data.priceKrw || null,
            stock: validated.data.stock,
            sku: validated.data.sku || null,
            image_url: validated.data.imageUrl || null,
            status: validated.data.status,
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/stores/${storeId}/products`)
    redirect(`/admin/stores/${storeId}/products`)
}

export async function updateProduct(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Please login' }

    const storeId = formData.get('storeId') as string
    const productId = formData.get('productId') as string
    if (!storeId) return { error: 'Store ID is required' }
    if (!productId) return { error: 'Product ID is required' }

    const validated = productSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        brand: formData.get('brand'),
        category: formData.get('category'),
        price: formData.get('price'),
        cost: formData.get('cost'),
        priceKrw: formData.get('priceKrw'),
        stock: formData.get('stock'),
        sku: formData.get('sku'),
        imageUrl: formData.get('imageUrl'),
        status: formData.get('status'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const { error } = await supabase
        .from('products')
        .update({
            name: validated.data.name,
            description: validated.data.description || null,
            brand: validated.data.brand || null,
            category: validated.data.category || null,
            price: validated.data.price,
            cost: validated.data.cost || null,
            price_krw: validated.data.priceKrw || null,
            stock: validated.data.stock,
            sku: validated.data.sku || null,
            image_url: validated.data.imageUrl || null,
            status: validated.data.status,
        })
        .eq('id', productId)
        .eq('tenant_id', storeId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/stores/${storeId}/products`)
    redirect(`/admin/stores/${storeId}/products`)
}
