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

async function getUserStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return data?.tenant_id
}

export async function createProduct(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const storeId = await getUserStoreId(supabase, user.id)
    if (!storeId) return { error: '找不到商店' }

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
            tenant_id: storeId,
            ...validated.data,
            image_url: validated.data.image_url || null,
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/app/products')
    redirect('/app/products')
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

    revalidatePath('/app/products')
    redirect('/app/products')
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

    revalidatePath('/app/products')
    return { success: true }
}
