'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { verifyTenantAccess } from '@/lib/tenant'
import { validateLineCredentials } from '@/lib/line/client'
import { z } from 'zod'

// ============================================================
// LINE Settings Server Actions
// Securely stores/retrieves LINE credentials
// ============================================================

function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    return createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
}

function getEncryptionKey(): string {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    return serviceKey.substring(0, 32)
}

const lineSettingsSchema = z.object({
    channelAccessToken: z.string().min(1, '請輸入 Channel Access Token'),
    channelSecret: z.string().min(1, '請輸入 Channel Secret'),
})

/**
 * Save LINE credentials (encrypted)
 */
export async function saveLineSettings(
    tenantId: string,
    isHQ: boolean,
    prevState: any,
    formData: FormData
) {
    // 1. Verify Access
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: '未授權：您沒有權限修改此設定' }

    // 2. Validate Input
    const validated = lineSettingsSchema.safeParse({
        channelAccessToken: formData.get('channelAccessToken'),
        channelSecret: formData.get('channelSecret'),
    })

    if (!validated.success) {
        return { error: validated.error.issues[0].message }
    }

    const { channelAccessToken, channelSecret } = validated.data

    // 3. Validate credentials against LINE API
    const validation = await validateLineCredentials(channelAccessToken)
    if (!validation.valid) {
        return { error: `金鑰驗證失敗：${validation.error}。請確認 Token 是否正確。` }
    }

    // 4. Encrypt & Store
    const encryptionKey = getEncryptionKey()
    const adminClient = getAdminClient()

    const secrets = [
        { type: 'line_channel_access_token', value: channelAccessToken },
        { type: 'line_channel_secret', value: channelSecret },
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

    // 5. Revalidate
    const basePath = isHQ ? '/admin' : '/app'
    revalidatePath(`${basePath}/settings/line`)
    return { success: true, message: `LINE 設定已儲存！Bot 名稱：${validation.botName}` }
}

/**
 * Get LINE Settings (masked for UI display)
 */
export async function getLineSettings(tenantId: string): Promise<{
    channelAccessToken: string
    channelSecret: string
    isConfigured: boolean
}> {
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) {
        return { channelAccessToken: '', channelSecret: '', isConfigured: false }
    }

    const encryptionKey = getEncryptionKey()
    const adminClient = getAdminClient()

    const results: Record<string, string> = {}

    for (const type of ['line_channel_access_token', 'line_channel_secret']) {
        const { data, error } = await adminClient.rpc('get_tenant_secret', {
            p_tenant_id: tenantId,
            p_secret_type: type,
            p_encryption_key: encryptionKey,
        })

        if (!error && data) {
            results[type] = data as string
        }
    }

    const isConfigured = !!(results['line_channel_access_token'] && results['line_channel_secret'])

    return {
        // Mask for UI display
        channelAccessToken: results['line_channel_access_token']
            ? `******${results['line_channel_access_token'].slice(-6)}`
            : '',
        channelSecret: results['line_channel_secret']
            ? `******${results['line_channel_secret'].slice(-4)}`
            : '',
        isConfigured,
    }
}

/**
 * Save welcome message to tenant settings
 */
export async function saveLineWelcomeMessage(
    tenantId: string,
    isHQ: boolean,
    prevState: any,
    formData: FormData
) {
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: '未授權' }

    const welcomeMessage = formData.get('welcomeMessage') as string || ''
    const lineId = formData.get('lineId') as string || ''
    const groupOrderingEnabled = formData.get('groupOrderingEnabled') === 'on'
    const dmOrderingEnabled = formData.get('dmOrderingEnabled') === 'on'
    const notifyShipped = formData.get('notifyShipped') === 'on'
    const notifyCompleted = formData.get('notifyCompleted') === 'on'
    const shippedMessage = formData.get('shippedMessage') as string || ''
    const completedMessage = formData.get('completedMessage') as string || ''

    const adminClient = getAdminClient()

    // Get current settings
    const { data: tenant } = await adminClient
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single()

    const currentSettings = (tenant?.settings as Record<string, any>) || {}

    // Merge LINE settings into existing settings
    const updatedSettings = {
        ...currentSettings,
        line: {
            ...(currentSettings.line || {}),
            welcome_message: welcomeMessage,
            line_id: lineId,
            group_ordering_enabled: groupOrderingEnabled,
            dm_ordering_enabled: dmOrderingEnabled,
            notify_shipped: notifyShipped,
            notify_completed: notifyCompleted,
            shipped_message: shippedMessage,
            completed_message: completedMessage,
        }
    }

    const { error } = await adminClient
        .from('tenants')
        .update({ settings: updatedSettings })
        .eq('id', tenantId)

    if (error) {
        return { error: `儲存失敗：${error.message}` }
    }

    const basePath = isHQ ? '/admin' : '/app'
    revalidatePath(`${basePath}/settings/line`)
    return { success: true, message: '歡迎訊息已更新' }
}

/**
 * Delete LINE credentials
 */
export async function deleteLineSettings(tenantId: string, isHQ: boolean) {
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: '未授權' }

    const adminClient = getAdminClient()

    for (const type of ['line_channel_access_token', 'line_channel_secret']) {
        await adminClient
            .from('tenant_secrets')
            .delete()
            .eq('tenant_id', tenantId)
            .eq('secret_type', type)
    }

    const basePath = isHQ ? '/admin' : '/app'
    revalidatePath(`${basePath}/settings/line`)
    return { success: true }
}
