'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteImage(url: string) {
    if (!url) return

    try {
        const supabase = await createClient()

        // Extract path from URL
        // Expected format: .../storage/v1/object/public/[bucket]/[path]
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/storage/v1/object/public/')

        if (pathParts.length < 2) return // Not a supabase storage URL

        const fullPath = pathParts[1] // e.g. "bucket/folder/file.jpg"
        const [bucket, ...rest] = fullPath.split('/')
        const filePath = rest.join('/')

        if (!bucket || !filePath) return

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
