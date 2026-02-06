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
    priceKrw: z.coerce.number().min(0).nullish().transform(v => v ?? undefined),
    stock: z.coerce.number().min(0).default(0),
    sku: z.string().nullish().transform(v => v || undefined),
    imageUrl: z.string().nullish().transform(v => v || undefined),
    status: z.enum(['draft', 'active', 'archived']).default('draft'),
    seoTitle: z.string().nullish().transform(v => v || undefined),
    seoDescription: z.string().nullish().transform(v => v || undefined),
    seoKeywords: z.string().nullish().transform(v => v || undefined),
    images: z.string().transform((str, ctx) => {
        try {
            return JSON.parse(str)
        } catch (e) {
            return []
        }
    }).optional(),
    options: z.string().transform((str, ctx) => {
        try {
            return JSON.parse(str)
        } catch (e) {
            return []
        }
    }).optional(),
    variants: z.string().transform((str, ctx) => {
        try {
            return JSON.parse(str)
        } catch (e) {
            return []
        }
    }).optional(),
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
        seoTitle: formData.get('seoTitle'),
        seoDescription: formData.get('seoDescription'),
        seoKeywords: formData.get('seoKeywords'),
        images: formData.get('images'),
        options: formData.get('options'),
        variants: formData.get('variants'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const { data: product, error } = await supabase
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
            seo_title: validated.data.seoTitle || null,
            seo_description: validated.data.seoDescription || null,
            seo_keywords: validated.data.seoKeywords || null,
            images: validated.data.images || [],
            options: validated.data.options || [],
            variants: undefined
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    // Insert Variants
    if (validated.data.variants && validated.data.variants.length > 0) {
        const variantsToInsert = validated.data.variants.map((v: any) => ({
            product_id: product.id,
            name: v.name,
            options: v.options,
            price: v.price || validated.data.price,
            stock: v.stock || 0,
            sku: v.sku
        }))

        await supabase.from('product_variants').insert(variantsToInsert)
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
        seoTitle: formData.get('seoTitle'),
        seoDescription: formData.get('seoDescription'),
        seoKeywords: formData.get('seoKeywords'),
        images: formData.get('images'),
        options: formData.get('options'),
        variants: formData.get('variants'),
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
            seo_title: validated.data.seoTitle || null,
            seo_description: validated.data.seoDescription || null,
            seo_keywords: validated.data.seoKeywords || null,
            images: validated.data.images || [],
            options: validated.data.options || [],
            variants: undefined
        })
        .eq('id', productId)
        .eq('tenant_id', storeId)

    if (error) {
        return { error: error.message }
    }

    // Update Variants
    if (validated.data.variants) {
        await supabase.from('product_variants').delete().eq('product_id', productId)

        if (validated.data.variants.length > 0) {
            const variantsToInsert = validated.data.variants.map((v: any) => ({
                product_id: productId,
                name: v.name,
                options: v.options,
                price: v.price || validated.data.price,
                stock: v.stock || 0,
                sku: v.sku
            }))

            await supabase.from('product_variants').insert(variantsToInsert)
        }
    }

    revalidatePath(`/admin/stores/${storeId}/products`)
    redirect(`/admin/stores/${storeId}/products`)
}
