'use server'

import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 200 * 1024 // 200KB

/**
 * 上傳商品圖片
 * 儲存路徑: products/{tenant_id}/{product_id}/{filename}
 */
export async function uploadProductImage(
    tenantId: string,
    productId: string,
    formData: FormData
) {
    const supabase = await createClient()

    const file = formData.get('file') as File
    if (!file) {
        return { error: '請選擇圖片' }
    }

    // 檢查檔案大小
    if (file.size > MAX_FILE_SIZE) {
        return { error: `圖片大小不能超過 ${MAX_FILE_SIZE / 1024}KB` }
    }

    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
        return { error: '只支援 JPG、PNG、WebP、GIF 格式' }
    }

    // 生成檔案路徑
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `main.${ext}`
    const filePath = `products/${tenantId}/${productId}/${fileName}`

    // 上傳到 Supabase Storage
    const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true, // 覆蓋現有檔案
        })

    if (error) {
        console.error('上傳失敗:', error)
        return { error: `上傳失敗: ${error.message}` }
    }

    // 取得公開 URL
    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

    // 更新商品的 image_url
    const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', productId)

    if (updateError) {
        return { error: `更新商品失敗: ${updateError.message}` }
    }

    return { success: true, url: publicUrl }
}

/**
 * 刪除商品圖片
 */
export async function deleteProductImage(
    tenantId: string,
    productId: string
) {
    const supabase = await createClient()

    const folderPath = `products/${tenantId}/${productId}`

    // 列出資料夾中的所有檔案
    const { data: files } = await supabase.storage
        .from('images')
        .list(folderPath)

    if (files && files.length > 0) {
        const filePaths = files.map(f => `${folderPath}/${f.name}`)
        await supabase.storage.from('images').remove(filePaths)
    }

    // 清除商品的 image_url
    await supabase
        .from('products')
        .update({ image_url: null })
        .eq('id', productId)

    return { success: true }
}
