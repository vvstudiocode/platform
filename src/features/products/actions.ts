'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { verifyTenantAccess } from '@/lib/tenant'
import { z } from 'zod'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
    status: z.enum(['draft', 'active', 'archived']).default('draft'),
    seo_title: z.string().nullish().transform(v => v || undefined),
    seo_description: z.string().nullish().transform(v => v || undefined),
    seo_keywords: z.string().nullish().transform(v => v || undefined),
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

// 處理圖片上傳與更新 Tenant 使用量
async function handleImageProcessing(supabase: any, tenantId: string, formData: FormData) {
    const { data: tenant } = await supabase
        .from('tenants')
        .select('storage_usage_mb, plan_id')
        .eq('id', tenantId)
        .single()

    let currentUsage = parseFloat(tenant?.storage_usage_mb || '0')
    let storageLimitMb = 50

    if (tenant?.plan_id) {
        const { data: plan } = await supabase
            .from('plans')
            .select('storage_limit_mb')
            .eq('id', tenant.plan_id)
            .single()
        if (plan) storageLimitMb = plan.storage_limit_mb
    }

    // Process Deletions
    const deletedImagesJson = formData.get('deleted_images') as string
    if (deletedImagesJson) {
        try {
            // Using the authenticated client (supabase) instead of Admin Client
            // RLS policies will ensure users can only delete their own files

            const deletedUrls: string[] = JSON.parse(deletedImagesJson)

            for (const url of deletedUrls) {
                const urlParts = url.split('/storage/v1/object/public/')
                if (urlParts.length > 1) {
                    const fullPath = urlParts[1]
                    const [bucket, ...pathParts] = fullPath.split('/')
                    const rawPath = pathParts.join('/')
                    const path = decodeURIComponent(rawPath)

                    if (bucket && path) {
                        // Check if file exists to update usage
                        const { data: files } = await supabase.storage.from(bucket).list(path.substring(0, path.lastIndexOf('/')), {
                            search: path.split('/').pop()
                        })

                        const fileMeta = files?.find((f: any) => f.name === path.split('/').pop())
                        if (fileMeta && fileMeta.metadata?.size) {
                            const sizeMb = fileMeta.metadata.size / (1024 * 1024)
                            currentUsage = Math.max(0, currentUsage - sizeMb)
                        }

                        const { error: deleteError } = await supabase.storage.from(bucket).remove([path])
                        if (deleteError) {
                            console.error('Failed to delete image:', path, deleteError)
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Error processing deletions:', e)
        }
    }

    // Process New Uploads
    const imageOrderJson = formData.get('image_order') as string || '[]'
    let imageOrder: string[] = []
    try {
        imageOrder = JSON.parse(imageOrderJson)
    } catch (e) {
        imageOrder = []
    }

    const finalImages: string[] = []

    for (const item of imageOrder) {
        if (item.startsWith('new_file_')) {
            const file = formData.get(item) as File
            if (file && file.size > 0) {
                const fileSizeMb = file.size / (1024 * 1024)
                if (currentUsage + fileSizeMb > storageLimitMb) {
                    throw new Error(`Storage quota exceeded! (${currentUsage.toFixed(2)}/${storageLimitMb} MB)`)
                }

                const timestamp = Date.now()
                // Use random string for uniqueness
                const randomStr = Math.random().toString(36).substring(2, 9)
                const extension = file.name.split('.').pop()
                const fileName = `${timestamp}_${randomStr}.${extension}`

                // IMPORTANT: Use tenantId as folder for isolation
                // New Path: [tenantId]/[fileName]
                const filePath = `${tenantId}/${fileName}`

                const { data, error } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file, { upsert: false })

                if (error) {
                    throw new Error('Image upload failed: ' + error.message)
                }

                const { data: publicUrlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(data.path)

                finalImages.push(publicUrlData.publicUrl)
                currentUsage += fileSizeMb
            }
        } else {
            finalImages.push(item)
        }
    }

    await supabase
        .from('tenants')
        .update({ storage_usage_mb: currentUsage })
        .eq('id', tenantId)

    return finalImages
}

// 自動生成商品編號
async function generateSKU(supabase: any, tenantId: string): Promise<string> {
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

export async function createProduct(
    tenantId: string,
    redirectPath: string,
    prevState: any,
    formData: FormData
) {
    const supabase = await createClient()

    // 權限驗證
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

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
        status: formData.get('status'),
        seo_title: formData.get('seo_title'),
        seo_description: formData.get('seo_description'),
        seo_keywords: formData.get('seo_keywords'),
        options: formData.get('options'),
        variants: formData.get('variants'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    try {
        const finalImages = await handleImageProcessing(supabase, tenantId, formData)

        let sku = validated.data.sku
        if (!sku || sku.trim() === '') {
            sku = await generateSKU(supabase, tenantId)
        }

        if (validated.data.brand) {
            await supabase.from('brands').upsert(
                { tenant_id: tenantId, name: validated.data.brand },
                { onConflict: 'tenant_id, name', ignoreDuplicates: true }
            )
        }
        if (validated.data.category) {
            await supabase.from('categories').upsert(
                { tenant_id: tenantId, name: validated.data.category },
                { onConflict: 'tenant_id, name', ignoreDuplicates: true }
            )
        }

        const { data: product, error } = await supabase
            .from('products')
            .insert({
                tenant_id: tenantId,
                ...validated.data,
                sku,
                image_url: finalImages[0] || null,
                images: finalImages,
                options: validated.data.options || [],
                variants: undefined,
                seo_title: validated.data.seo_title || null,
                seo_description: validated.data.seo_description || null,
                seo_keywords: validated.data.seo_keywords || null,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)

        if (validated.data.variants && validated.data.variants.length > 0) {
            const variantsToInsert = validated.data.variants.map((v: any) => ({
                product_id: product.id,
                name: v.name,
                options: v.options,
                price: v.price || validated.data.price,
                stock: v.stock || 0,
                sku: v.sku || sku
            }))
            await supabase.from('product_variants').insert(variantsToInsert)
        }

    } catch (e: any) {
        console.error('Create Product Error:', e)
        return { error: e.message || '建立商品失敗' }
    }

    revalidatePath(redirectPath)
    redirect(redirectPath)
}

export async function updateProduct(
    tenantId: string,
    productId: string,
    redirectPath: string,
    prevState: any,
    formData: FormData
) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

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
        status: formData.get('status'),
        seo_title: formData.get('seo_title'),
        seo_description: formData.get('seo_description'),
        seo_keywords: formData.get('seo_keywords'),
        options: formData.get('options'),
        variants: formData.get('variants'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    try {
        const finalImages = await handleImageProcessing(supabase, tenantId, formData)

        if (validated.data.brand) {
            await supabase.from('brands').upsert(
                { tenant_id: tenantId, name: validated.data.brand },
                { onConflict: 'tenant_id, name', ignoreDuplicates: true }
            )
        }
        if (validated.data.category) {
            await supabase.from('categories').upsert(
                { tenant_id: tenantId, name: validated.data.category },
                { onConflict: 'tenant_id, name', ignoreDuplicates: true }
            )
        }

        const { error } = await supabase
            .from('products')
            .update({
                ...validated.data,
                image_url: finalImages[0] || null,
                images: finalImages,
                options: validated.data.options || [],
                variants: undefined,
                seo_title: validated.data.seo_title || null,
                seo_description: validated.data.seo_description || null,
                seo_keywords: validated.data.seo_keywords || null,
            })
            .eq('id', productId)
            .eq('tenant_id', tenantId)

        if (error) throw new Error(error.message)

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

    } catch (e: any) {
        console.error('Update Product Error:', e)
        return { error: e.message || '更新商品失敗' }
    }

    revalidatePath(redirectPath)
    redirect(redirectPath)
}

export async function deleteProduct(tenantId: string, productId: string) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('tenant_id', tenantId)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function updateProductStatus(tenantId: string, productId: string, status: string) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', productId)
        .eq('tenant_id', tenantId)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function updateProductOrder(tenantId: string, orderData: { id: string; order: number }[]) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    for (const item of orderData) {
        await supabase
            .from('products')
            .update({ sort_order: item.order })
            .eq('id', item.id)
            .eq('tenant_id', tenantId)
    }

    return { success: true }
}

export async function generateNewSKU(tenantId: string) {
    const supabase = await createClient()

    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) throw new Error('Unauthorized')

    return await generateSKU(supabase, tenantId)
}
