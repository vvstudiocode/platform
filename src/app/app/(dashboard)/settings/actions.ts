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
        bank_name: formData.get('bank_name') || '',
        bank_account: formData.get('bank_account') || '',
        bank_code: formData.get('bank_code') || '',
        payment_message: formData.get('payment_message') || '',
        shipping_pickup_fee: Number(formData.get('shipping_pickup_fee')) || 0,
        shipping_711_fee: Number(formData.get('shipping_711_fee')) || 60,
        shipping_home_fee: Number(formData.get('shipping_home_fee')) || 100,
    }

    // 解析頁尾設定
    const footer_settings = {
        socialLinks: {
            line: formData.get('footer_line') || '',
            facebook: formData.get('footer_facebook') || '',
            instagram: formData.get('footer_instagram') || '',
            threads: formData.get('footer_threads') || '',
            youtube: formData.get('footer_youtube') || '',
        },
        email: formData.get('footer_email') || '',
        phone: formData.get('footer_phone') || '',
        address: formData.get('footer_address') || '',
        about: formData.get('footer_about') || '',
        copyright: formData.get('footer_copyright') || '',
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

    revalidatePath('/app/settings')
    return { success: true }
}
