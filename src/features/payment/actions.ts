'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { verifyTenantAccess } from '@/lib/tenant'
import { z } from 'zod'

// Validation schema
const paymentSettingsSchema = z.object({
    merchantId: z.string().min(1, '請輸入商店代號 (Merchant ID)'),
    hashKey: z.string().min(1, '請輸入 HashKey'),
    hashIV: z.string().min(1, '請輸入 HashIV'),
})

// Get Admin Supabase Client (bypasses RLS for secure operations)
function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    return createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
}

// Get Encryption Key (using a consistent, server-only key)
function getEncryptionKey(): string {
    // Use service role key's first 32 chars as encryption key
    // This is secure because:
    // 1. Service role key is ONLY on server
    // 2. It's a 256-bit equivalent for AES
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    return serviceKey.substring(0, 32)
}

/**
 * Save Payment Settings (ECPay credentials)
 * Securely stores each credential in tenant_secrets table
 */
export async function savePaymentSettings(
    tenantId: string,
    isHQ: boolean,
    prevState: any,
    formData: FormData
) {
    // 1. Verify Access
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: '未授權：您沒有權限修改此設定' }

    // 2. Validate Input
    const validated = paymentSettingsSchema.safeParse({
        merchantId: formData.get('merchantId'),
        hashKey: formData.get('hashKey'),
        hashIV: formData.get('hashIV'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const { merchantId, hashKey, hashIV } = validated.data
    const encryptionKey = getEncryptionKey()
    const adminClient = getAdminClient()

    // 3. Store each secret using the database function
    const secrets = [
        { type: 'ecpay_merchant_id', value: merchantId },
        { type: 'ecpay_hash_key', value: hashKey },
        { type: 'ecpay_hash_iv', value: hashIV },
    ]

    for (const secret of secrets) {
        const { error } = await adminClient.rpc('set_tenant_secret', {
            p_tenant_id: tenantId,
            p_secret_type: secret.type,
            p_raw_value: secret.value,
            p_encryption_key: encryptionKey,
        })

        if (error) {
            console.error(`Failed to save ${secret.type}:`, error)
            return { error: `儲存 ${secret.type} 失敗：${error.message}` }
        }
    }

    // 4. Revalidate path
    revalidatePath(isHQ ? '/admin/settings/payment' : '/app/settings/payment')
    return { success: true, message: '收款設定已儲存' }
}

/**
 * Get Payment Settings
 * Retrieves decrypted credentials (returns masked values for UI)
 */
export async function getPaymentSettings(tenantId: string): Promise<{
    merchantId: string
    hashKey: string
    hashIV: string
    isConfigured: boolean
}> {
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) {
        return { merchantId: '', hashKey: '', hashIV: '', isConfigured: false }
    }

    const encryptionKey = getEncryptionKey()
    const adminClient = getAdminClient()

    const results: Record<string, string> = {}

    for (const type of ['ecpay_merchant_id', 'ecpay_hash_key', 'ecpay_hash_iv']) {
        const { data, error } = await adminClient.rpc('get_tenant_secret', {
            p_tenant_id: tenantId,
            p_secret_type: type,
            p_encryption_key: encryptionKey,
        })

        if (!error && data) {
            results[type] = data as string
        }
    }

    const isConfigured = !!(results['ecpay_merchant_id'] && results['ecpay_hash_key'] && results['ecpay_hash_iv'])

    return {
        merchantId: results['ecpay_merchant_id'] || '',
        // Mask keys for display (show only last 4 chars)
        hashKey: results['ecpay_hash_key'] ? `******${results['ecpay_hash_key'].slice(-4)}` : '',
        hashIV: results['ecpay_hash_iv'] ? `******${results['ecpay_hash_iv'].slice(-4)}` : '',
        isConfigured,
    }
}

/**
 * Get Raw Payment Credentials (for checkout use ONLY)
 * This returns unmasked values - NEVER expose to client
 */
export async function getRawPaymentCredentials(tenantId: string): Promise<{
    merchantId: string
    hashKey: string
    hashIV: string
} | null> {
    const encryptionKey = getEncryptionKey()
    const adminClient = getAdminClient()

    const results: Record<string, string> = {}

    for (const type of ['ecpay_merchant_id', 'ecpay_hash_key', 'ecpay_hash_iv']) {
        const { data, error } = await adminClient.rpc('get_tenant_secret', {
            p_tenant_id: tenantId,
            p_secret_type: type,
            p_encryption_key: encryptionKey,
        })

        if (error || !data) {
            return null // Missing credentials
        }
        results[type] = data as string
    }

    return {
        merchantId: results['ecpay_merchant_id'],
        hashKey: results['ecpay_hash_key'],
        hashIV: results['ecpay_hash_iv'],
    }
}

/**
 * Delete Payment Settings
 */
export async function deletePaymentSettings(tenantId: string, isHQ: boolean) {
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: '未授權' }

    const adminClient = getAdminClient()

    for (const type of ['ecpay_merchant_id', 'ecpay_hash_key', 'ecpay_hash_iv']) {
        await adminClient
            .from('tenant_secrets')
            .delete()
            .eq('tenant_id', tenantId)
            .eq('secret_type', type)
    }

    revalidatePath(isHQ ? '/admin/settings/payment' : '/app/settings/payment')
    return { success: true }
}
