'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteImage(url: string) {
    if (!url) return

    try {
        const supabase = await createClient()

        // 驗證用戶是否已登入
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { error: 'Unauthorized' }
        }

        // Extract path from URL
        // Expected format: .../storage/v1/object/public/[bucket]/[path]
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/storage/v1/object/public/')

        if (pathParts.length < 2) return // Not a supabase storage URL

        const fullPath = pathParts[1] // e.g. "bucket/folder/file.jpg"
        const [bucket, ...rest] = fullPath.split('/')
        const filePath = rest.join('/')

        if (!bucket || !filePath) return

        // 嘗試從路徑中獲取 Tenant ID
        const folderName = filePath.split('/')[0]

        // 如果是舊的 'content/' 檔案，或者不是 UUID 格式的資料夾
        // RLS 策略會阻止刪除 (除非是 Super Admin)
        // 這是預期的行為：防止用戶刪除舊的、未歸戶的檔案

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath])

        if (error) {
            console.error('Error deleting image:', error)
            return { error: error.message }
        }

        return { success: true }
    } catch (e: any) {
        console.error('Error parsing/deleting image:', e)
        return { error: e.message }
    }
}
