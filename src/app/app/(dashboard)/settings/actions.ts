'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const storeSchema = z.object({
    name: z.string().min(1, '請輸入商店名稱'),
    description: z.string().optional(),
    logo_url: z.string().url().optional().or(z.literal('')),
})

export async function updateStoreSettings(storeId: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    const validated = storeSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        logo_url: formData.get('logo_url'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    // 解析設定
    const settings = {
        // Remittance Info (Formerly Payment Defaults)
        bank_name: (formData.get('bank_name') as string) || '',
        bank_account: (formData.get('bank_account') as string) || '',
        bank_code: (formData.get('bank_code') as string) || '',
        payment_message: (formData.get('payment_message') as string) || '',

        // Shipping Fees
        shipping_pickup_fee: Number(formData.get('shipping_pickup_fee')) || 0,
        shipping_711_fee: Number(formData.get('shipping_711_fee')) || 60,
        shipping_home_fee: Number(formData.get('shipping_home_fee')) || 100,
        shipping_pickup_name: (formData.get('shipping_pickup_name') as string) || '面交取貨',
        shipping_711_name: (formData.get('shipping_711_name') as string) || '7-11 店到店',
        shipping_home_name: (formData.get('shipping_home_name') as string) || '宅配到府',

        // Payment Methods
        payment_methods: {
            credit_card: formData.get('payment_credit_card') === 'on',
            bank_transfer: formData.get('payment_bank_transfer') === 'on',
        }
    }

    // 解析頁尾設定
    const footer_settings = {
        socialLinks: {
            line: (formData.get('footer_line') as string) || '',
            facebook: (formData.get('footer_facebook') as string) || '',
            instagram: (formData.get('footer_instagram') as string) || '',
            threads: (formData.get('footer_threads') as string) || '',
            youtube: (formData.get('footer_youtube') as string) || '',
        },
        email: (formData.get('footer_email') as string) || '',
        phone: (formData.get('footer_phone') as string) || '',
        address: (formData.get('footer_address') as string) || '',
        about: (formData.get('footer_about') as string) || '',
        copyright: (formData.get('footer_copyright') as string) || '',
    }

    // Validate Phone if present
    if (footer_settings.phone && !/^\d{10}$/.test(footer_settings.phone as string)) {
        return { error: '電話號碼必須為 10 碼數字' }
    }

    const { error } = await supabase
        .from('tenants')
        .update({
            ...validated.data,
            logo_url: validated.data.logo_url || null,
            settings,
            footer_settings,
        })
        .eq('id', storeId)

    if (error) {
        return { error: error.message }
    }

    // Log Audit Action
    const { logAuditAction } = await import('@/lib/audit')
    await logAuditAction({
        tenantId: storeId,
        action: 'UPDATE_SETTINGS',
        entityType: 'store_settings',
        entityId: storeId,
        details: { settings, footer_settings }
    })

    revalidatePath('/app/settings')
    return { success: true }
}
