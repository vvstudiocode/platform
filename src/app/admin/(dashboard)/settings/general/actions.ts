'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const settingsSchema = z.object({
    name: z.string().min(1, '商店名稱不能為空'),
    logo_url: z.string().url('Logo 網址格式錯誤').optional().or(z.literal('')),
    primary_color: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, '顏色格式錯誤').optional().or(z.literal('')),
    support_email: z.string().email('Email 格式錯誤').optional().or(z.literal('')),

    // Bank
    bank_name: z.string().optional(),
    bank_code: z.string().optional(),
    bank_account: z.string().optional(),
    payment_message: z.string().optional(),

    // Shipping Fees (Convert to number)
    shipping_pickup_fee: z.coerce.number().optional(),
    shipping_711_fee: z.coerce.number().optional(),
    shipping_home_fee: z.coerce.number().optional(),

    // Shipping Names
    shipping_pickup_name: z.string().optional(),
    shipping_711_name: z.string().optional(),
    shipping_home_name: z.string().optional(),

    // Footer
    footer_line: z.string().optional(),
    footer_facebook: z.string().optional(),
    footer_instagram: z.string().optional(),
    footer_threads: z.string().optional(),
    footer_youtube: z.string().optional(),
    footer_email: z.string().optional(),
    footer_phone: z.string().optional(),
    footer_address: z.string().optional(),
    footer_about: z.string().optional(),
    footer_copyright: z.string().optional()
})

export type State = {
    error?: string | null
    success?: string | null
}

export async function updateGeneralSettings(prevState: any, formData: FormData): Promise<State> {
    const supabase = await createClient()

    // 取得當前 User 關聯的 Tenant
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    // Check if super admin
    const { data: role } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .maybeSingle()

    console.log('[Debug Settings] User:', user.id, user.email)
    console.log('[Debug Settings] Role:', role)

    let tenant;

    if (role) {
        // If super admin, prioritize 'hq' tenant
        const { data: hqTenant } = await supabase
            .from('tenants')
            .select('id, settings')
            .eq('slug', 'hq')
            .maybeSingle()

        console.log('[Debug Settings] HQ Tenant:', hqTenant)

        if (hqTenant) {
            tenant = hqTenant
        } else {
            // Fallback to managed_by if 'hq' not found
            const { data: managedTenant } = await supabase
                .from('tenants')
                .select('id, settings')
                .eq('managed_by', user.id)
                .maybeSingle()
            console.log('[Debug Settings] Managed Tenant (Fallback):', managedTenant)
            tenant = managedTenant
        }
    } else {
        // Not super admin, must be managed_by
        const { data: managedTenant } = await supabase
            .from('tenants')
            .select('id, settings')
            .eq('managed_by', user.id)
            .maybeSingle()

        console.log('[Debug Settings] Managed Tenant (Direct):', managedTenant)
        tenant = managedTenant
    }

    // 如果找不到 (可能是 collaborative user)，則暫時不允許修改，或需要更完整的權限系統
    if (!tenant) {
        return { error: '找不到可管理的商店設定權限' }
    }

    const rawData = {
        name: formData.get('name'),
        description: formData.get('description'),
        logo_url: formData.get('logo_url'),
        primary_color: formData.get('primary_color'),
        support_email: formData.get('support_email'),

        bank_name: formData.get('bank_name'),
        bank_code: formData.get('bank_code'),
        bank_account: formData.get('bank_account'),
        payment_message: formData.get('payment_message'),

        shipping_pickup_fee: formData.get('shipping_pickup_fee'),
        shipping_711_fee: formData.get('shipping_711_fee'),
        shipping_home_fee: formData.get('shipping_home_fee'),
        shipping_pickup_name: formData.get('shipping_pickup_name'),
        shipping_711_name: formData.get('shipping_711_name'),
        shipping_home_name: formData.get('shipping_home_name'),

        footer_line: formData.get('footer_line'),
        footer_facebook: formData.get('footer_facebook'),
        footer_instagram: formData.get('footer_instagram'),
        footer_threads: formData.get('footer_threads'),
        footer_youtube: formData.get('footer_youtube'),
        footer_email: formData.get('footer_email'),
        footer_phone: formData.get('footer_phone'),
        footer_address: formData.get('footer_address'),
        footer_about: formData.get('footer_about'),
        footer_copyright: formData.get('footer_copyright')
    }

    const validated = settingsSchema.safeParse(rawData)

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const {
        name, logo_url, primary_color, support_email,
        bank_name, bank_code, bank_account, payment_message,
        shipping_pickup_fee, shipping_711_fee, shipping_home_fee,
        shipping_pickup_name, shipping_711_name, shipping_home_name,
        footer_line, footer_facebook, footer_instagram, footer_threads,
        footer_youtube, footer_email, footer_phone, footer_address,
        footer_about, footer_copyright
    } = validated.data

    // Merge settings
    const currentSettings = (tenant.settings as Record<string, any>) || {}
    const newSettings = {
        ...currentSettings,
        primary_color,
        support_email,
        bank_name, bank_code, bank_account, payment_message,
        shipping_pickup_fee, shipping_711_fee, shipping_home_fee,
        shipping_pickup_name, shipping_711_name, shipping_home_name,
        footer_line, footer_facebook, footer_instagram, footer_threads,
        footer_youtube, footer_email, footer_phone, footer_address,
        footer_about, footer_copyright
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
