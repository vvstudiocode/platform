import { createClient } from '@/lib/supabase/client'

export type UploadBucket = 'product-images' | 'store-logos'

export interface UploadOptions {
    bucket: UploadBucket
    folder?: string
    maxSizeMB?: number
}

/**
 * 上傳圖片到 Supabase Storage
 * @param file 圖片檔案
 * @param options 上傳選項
 * @returns 圖片的公開 URL
 */
export async function uploadImage(
    file: File,
    options: UploadOptions
): Promise<string> {
    const { bucket, folder, maxSizeMB = 5 } = options

    // 驗證檔案大小
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
        throw new Error(`檔案大小不可超過 ${maxSizeMB}MB`)
    }

    // 驗證檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
        throw new Error('只支援 JPG、PNG、WebP、GIF 格式')
    }

    const supabase = createClient()

    // 產生唯一檔名
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomStr}.${extension}`

    // 組合路徑
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // 上傳檔案
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        })

    if (error) {
        throw new Error(`上傳失敗: ${error.message}`)
    }

    // 取得公開 URL
    const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

    return publicUrlData.publicUrl
}

/**
 * 刪除圖片
 */
export async function deleteImage(
    url: string,
    bucket: UploadBucket
): Promise<void> {
    const supabase = createClient()

    // 從 URL 中提取檔案路徑
    const urlParts = url.split('/')
    const fileName = urlParts[urlParts.length - 1]

    const { error } = await supabase.storage.from(bucket).remove([fileName])

    if (error) {
        console.error('刪除圖片失敗:', error)
    }
}

/**
 * 驗證圖片檔案
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: '只支援 JPG、PNG、WebP、GIF 格式' }
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
        return { valid: false, error: '檔案大小不可超過 5MB' }
    }

    return { valid: true }
}
