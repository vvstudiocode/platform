'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const settingsSchema = z.object({
    name: z.string().min(1, '商店名稱不能為空'),
    logo_url: z.string().url('Logo 網址格式錯誤').optional().or(z.literal('')),
    primary_color: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, '顏色格式錯誤').optional().or(z.literal('')),
    support_email: z.string().email('Email 格式錯誤').optional().or(z.literal(''))
})

export async function updateGeneralSettings(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 取得當前管理的商店 (HQ 或 Store)
    // 這裡我們假設是在 HQ 後台設定 HQ 本身，或者是 Store Owner 設定自己的 Store
    // 但目前路由是 /admin/settings/general，比較像全是 HQ 的全域設定？
    // 根據需求 "總部也要有商店設定"，這裡應該是指 HQ 自己的 tenants 記錄設定。
    // 無論是 HQ 還是 Store Admin，我們都需要知道 tenant_id。
    // 對於 /admin/settings，我們假設是用戶管理的 tenant (如果是 HQ Admin，就是 HQ tenant)

    // 取得當前 User 關聯的 Tenant
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    // 查詢 User 管理的 Tenant
    // 這裡若是 Super Admin (HQ)，他可能管理 'hq' tenant。
    // 我們先查找 `tenants` table where `managed_by` = user.id OR slug = 'hq' (if super admin permissions check passes)
    // 為了簡化，我們先抓 user 關聯的第一個 tenant (通常每個 user 只有一個 store，HQ admin 則管理 HQ)

    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, settings')
        .eq('managed_by', user.id) // 簡易權限檢查：只能改自己管理的
        .single()

    // 如果找不到 (可能是 collaborative user)，則暫時不允許修改，或需要更完整的權限系統
    if (!tenant) {
        // Fallback check for HQ if user has role (skip role check for now, assume managed_by is correct)
        return { error: '找不到可管理的商店設定權限' }
    }

    const rawData = {
        name: formData.get('name'),
        logo_url: formData.get('logo_url'),
        primary_color: formData.get('primary_color'),
        support_email: formData.get('support_email')
    }

    const validated = settingsSchema.safeParse(rawData)

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const { name, logo_url, primary_color, support_email } = validated.data

    // Merge settings
    const currentSettings = (tenant.settings as Record<string, any>) || {}
    const newSettings = {
        ...currentSettings,
        primary_color,
        support_email
    }

    const { error } = await supabase
        .from('tenants')
        .update({
            name,
            logo_url,
            settings: newSettings
        })
        .eq('id', tenant.id)

    if (error) {
        return { error: '更新失敗: ' + error.message }
    }

    revalidatePath('/admin/settings/general')
    revalidatePath('/', 'layout') // 更新全站資訊 (Logo/Name 可能在 Header)

    return { success: '設定已更新' }
}
