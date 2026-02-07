'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
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
    // SEO 欄位
    seo_title: z.string().nullish().transform(v => v || undefined),
    seo_description: z.string().nullish().transform(v => v || undefined),
    seo_keywords: z.string().nullish().transform(v => v || undefined),
    // Multi-image and Variants
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

// 處理圖片上傳與更新 Tenant 使用量
async function handleImageProcessing(supabase: any, tenantId: string, formData: FormData) {
    // 1. Get current tenant usage and plan limit
    const { data: tenant } = await supabase
        .from('tenants')
        .select('storage_usage_mb, plan_id')
        .eq('id', tenantId)
        .single()

    let currentUsage = parseFloat(tenant?.storage_usage_mb || '0')
    let storageLimitMb = 50 // Default Free

    if (tenant?.plan_id) {
        const { data: plan } = await supabase
            .from('plans')
            .select('storage_limit_mb')
            .eq('id', tenant.plan_id)
            .single()
        if (plan) storageLimitMb = plan.storage_limit_mb
    }

    // 2. Process Deletions
    const deletedImagesJson = formData.get('deleted_images') as string
    if (deletedImagesJson) {
        try {
            // Use Admin Client to bypass RLS for storage operations
            const supabaseAdmin = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

            const deletedUrls: string[] = JSON.parse(deletedImagesJson)
            console.log('Admin Processing deletions:', deletedUrls)

            for (const url of deletedUrls) {
                // Determine bucket and path from URL
                // URL format: .../storage/v1/object/public/{bucket}/{path}
                const urlParts = url.split('/storage/v1/object/public/')
                if (urlParts.length > 1) {
                    const fullPath = urlParts[1]
                    const [bucket, ...pathParts] = fullPath.split('/')
                    const rawPath = pathParts.join('/')
                    const path = decodeURIComponent(rawPath)

                    console.log('Deleting from bucket:', bucket, 'path:', path)

                    if (bucket && path) {
                        // Get file metadata to find size
                        const folderPath = path.substring(0, path.lastIndexOf('/'))
                        const fileName = path.split('/').pop()

                        const { data: files, error: listError } = await supabaseAdmin.storage.from(bucket).list(folderPath, {
                            search: fileName
                        })

                        if (listError) console.error('List error:', listError)

                        const fileMeta = files?.find((f: any) => f.name === fileName)
                        if (fileMeta && fileMeta.metadata?.size) {
                            const sizeMb = fileMeta.metadata.size / (1024 * 1024)
                            currentUsage = Math.max(0, currentUsage - sizeMb)
                            console.log('Decremented usage by:', sizeMb, 'New usage:', currentUsage)
                        } else {
                            console.warn('File metadata not found for size decrement:', path)
                        }

                        // Remove file
                        const { error: removeError } = await supabaseAdmin.storage.from(bucket).remove([path])
                        if (removeError) console.error('Remove error:', removeError)
                        else console.log('File removed successfully:', path)
                    }
                }
            }
        } catch (e) {
            console.error('Error processing deletions:', e)
        }
    }

    // 3. Process New Uploads & Rebuild List
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
            // It's a key for FormData file
            const file = formData.get(item) as File
            if (file && file.size > 0) {
                // Check Quota
                const fileSizeMb = file.size / (1024 * 1024)
                if (currentUsage + fileSizeMb > storageLimitMb) {
                    throw new Error(`Storage quota exceeded! (${currentUsage.toFixed(2)}/${storageLimitMb} MB)`)
                }

                // Upload
                const timestamp = Date.now()
                const randomStr = Math.random().toString(36).substring(2, 9)
                const extension = file.name.split('.').pop()
                const fileName = `${timestamp}_${randomStr}.${extension}`
                const filePath = `content/${fileName}` // Standardize folder

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
            // It's an existing URL
            finalImages.push(item)
        }
    }

    // Update tenant usage
    await supabase
        .from('tenants')
        .update({ storage_usage_mb: currentUsage })
        .eq('id', tenantId)

    return finalImages
}

export async function createProduct(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const hqStoreId = await getHQStoreId(supabase, user.id)
    if (!hqStoreId) return { error: '找不到總部商店' }

    // Valiate Basic Fields
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
        // Process Images (Uploads & Deletions)
        const finalImages = await handleImageProcessing(supabase, hqStoreId, formData)

        // Generate SKU if needed
        let sku = validated.data.sku
        if (!sku || sku.trim() === '') {
            sku = await generateSKU(supabase, hqStoreId)
        }

        // Save Attributes
        if (validated.data.brand) {
            await supabase.from('brands').upsert({ tenant_id: hqStoreId, name: validated.data.brand }, { onConflict: 'tenant_id, name', ignoreDuplicates: true })
        }
        if (validated.data.category) {
            await supabase.from('categories').upsert({ tenant_id: hqStoreId, name: validated.data.category }, { onConflict: 'tenant_id, name', ignoreDuplicates: true })
        }

        // Insert Product
        const { data: product, error } = await supabase
            .from('products')
            .insert({
                tenant_id: hqStoreId,
                ...validated.data,
                sku,
                image_url: finalImages[0] || null, // First image as main
                images: finalImages,
                options: validated.data.options || [],
                variants: undefined, // Handled separately
                seo_title: validated.data.seo_title || null,
                seo_description: validated.data.seo_description || null,
                seo_keywords: validated.data.seo_keywords || null,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)

        // Insert Variants
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
        const hqStoreId = await getHQStoreId(supabase, user.id)
        if (!hqStoreId) return { error: '找不到總部商店' }

        // Process Images
        const finalImages = await handleImageProcessing(supabase, hqStoreId, formData)

        // Save Attributes
        if (validated.data.brand) {
            await supabase.from('brands').upsert({ tenant_id: hqStoreId, name: validated.data.brand }, { onConflict: 'tenant_id, name', ignoreDuplicates: true })
        }
        if (validated.data.category) {
            await supabase.from('categories').upsert({ tenant_id: hqStoreId, name: validated.data.category }, { onConflict: 'tenant_id, name', ignoreDuplicates: true })
        }

        // Update Product
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

        if (error) throw new Error(error.message)

        // Handle Variants
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

// Client 端呼叫的 Server Action wrapper
export async function generateNewSKU() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('請先登入')

    const hqStoreId = await getHQStoreId(supabase, user.id)
    if (!hqStoreId) throw new Error('找不到總部商店')

    return await generateSKU(supabase, hqStoreId)
}
