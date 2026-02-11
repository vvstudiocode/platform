'use server'

import { createClient } from '@/lib/supabase/server'
import { verifyTenantAccess } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const settingsSchema = z.object({
    name: z.string().min(1, '商店名稱不能為空'),
    description: z.string().nullish(),
    logo_url: z.string().url('Logo 網址格式錯誤').nullish().or(z.literal('')),
    primary_color: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, '顏色格式錯誤').nullish().or(z.literal('')),
    support_email: z.string().email('Email 格式錯誤').nullish().or(z.literal('')),

    // Payment/Bank
    bank_name: z.string().nullish(),
    bank_code: z.string().nullish(),
    bank_account: z.string().nullish(),
    payment_message: z.string().nullish(),

    // Shipping
    shipping_pickup_fee: z.coerce.number().nullish(),
    shipping_711_fee: z.coerce.number().nullish(),
    shipping_home_fee: z.coerce.number().nullish(),
    shipping_pickup_name: z.string().nullish(),
    shipping_711_name: z.string().nullish(),
    shipping_home_name: z.string().nullish(),
    free_shipping_threshold: z.coerce.number().min(0).nullish(),

    // Payment Methods
    payment_credit_card: z.boolean().nullish(),
    payment_bank_transfer: z.boolean().nullish(),

    // Footer
    footer_line: z.string().nullish(),
    footer_facebook: z.string().nullish(),
    footer_instagram: z.string().nullish(),
    footer_threads: z.string().nullish(),
    footer_youtube: z.string().nullish(),
    footer_email: z.string().nullish(),
    footer_phone: z.string().nullish(),
    footer_address: z.string().nullish(),
    footer_about: z.string().nullish(),
    footer_copyright: z.string().nullish()
})

export type State = {
    error?: string
    success?: boolean
}

export async function updateGeneralSettings(
    tenantId: string,
    prevState: any,
    formData: FormData
): Promise<State> {
    const supabase = await createClient()

    // 權限驗證
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }


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
        free_shipping_threshold: formData.get('free_shipping_threshold'),

        payment_credit_card: formData.get('payment_credit_card') === 'on',
        payment_bank_transfer: formData.get('payment_bank_transfer') === 'on',

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
        name, description, logo_url, primary_color, support_email,
        bank_name, bank_code, bank_account, payment_message,
        shipping_pickup_fee, shipping_711_fee, shipping_home_fee,
        shipping_pickup_name, shipping_711_name, shipping_home_name,
        free_shipping_threshold,
        payment_credit_card, payment_bank_transfer,
        footer_line, footer_facebook, footer_instagram, footer_threads,
        footer_youtube, footer_email, footer_phone, footer_address,
        footer_about, footer_copyright
    } = validated.data

    // Get current settings to merge
    const { data: currentTenant } = await supabase
        .from('tenants')
        .select('settings, footer_settings')
        .eq('id', tenantId)
        .single()

    const currentSettings = (currentTenant?.settings as Record<string, any>) || {}
    const newSettings = {
        ...currentSettings,
        primary_color,
        support_email,
        bank_name, bank_code, bank_account, payment_message,
        shipping_pickup_fee, shipping_711_fee, shipping_home_fee,
        shipping_pickup_name, shipping_711_name, shipping_home_name,
        free_shipping_threshold,
        payment_methods: {
            // Ensure these are explicitly booleans, even if Zod or FormData is weird
            credit_card: Boolean(payment_credit_card),
            bank_transfer: Boolean(payment_bank_transfer)
        }
    }

    const currentFooter = (currentTenant?.footer_settings as Record<string, any>) || {}
    const newFooterSettings = {
        ...currentFooter,
        email: footer_email,
        phone: footer_phone,
        address: footer_address,
        about: footer_about,
        copyright: footer_copyright,
        socialLinks: {
            line: footer_line,
            facebook: footer_facebook,
            instagram: footer_instagram,
            threads: footer_threads,
            youtube: footer_youtube
        }
    }

    const { error } = await supabase
        .from('tenants')
        .update({
            name,
            description: description || null,
            logo_url: logo_url || null,
            settings: newSettings,
            footer_settings: newFooterSettings
        })
        .eq('id', tenantId)

    if (error) {
        console.log('[[DEBUG PAYMENT]] Database error:', error)
        return { error: '更新失敗: ' + error.message }
    }

    console.log('[[DEBUG PAYMENT]] Save successful!')
    return { success: true }
}
