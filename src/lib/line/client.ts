import { messagingApi, HTTPFetchError } from '@line/bot-sdk'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// ============================================================
// LINE Client Wrapper
// Securely initializes LINE SDK using encrypted tenant secrets
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

/**
 * Get LINE credentials for a tenant (decrypted)
 * NEVER expose these values to the client
 */
export async function getLineCredentials(tenantId: string): Promise<{
    channelAccessToken: string
    channelSecret: string
} | null> {
    const encryptionKey = getEncryptionKey()
    const adminClient = getAdminClient()

    const results: Record<string, string> = {}

    for (const type of ['line_channel_access_token', 'line_channel_secret']) {
        const { data, error } = await adminClient.rpc('get_tenant_secret', {
            p_tenant_id: tenantId,
            p_secret_type: type,
            p_encryption_key: encryptionKey,
        })

        if (error || !data) return null
        results[type] = data as string
    }

    return {
        channelAccessToken: results['line_channel_access_token'],
        channelSecret: results['line_channel_secret'],
    }
}

/**
 * Get initialized LINE Messaging API client for a tenant
 */
export async function getLineClient(tenantId: string): Promise<messagingApi.MessagingApiClient | null> {
    const credentials = await getLineCredentials(tenantId)
    if (!credentials) return null

    return new messagingApi.MessagingApiClient({
        channelAccessToken: credentials.channelAccessToken,
    })
}

/**
 * Verify LINE webhook signature
 */
export function verifySignature(
    channelSecret: string,
    signature: string,
    body: string
): boolean {
    const crypto = require('crypto')
    const hash = crypto
        .createHmac('sha256', channelSecret)
        .update(body)
        .digest('base64')
    return hash === signature
}

/**
 * Validate that LINE credentials are working by calling the bot info API
 */
export async function validateLineCredentials(channelAccessToken: string): Promise<{
    valid: boolean
    botName?: string
    error?: string
}> {
    try {
        const client = new messagingApi.MessagingApiClient({ channelAccessToken })
        const info = await client.getBotInfo()
        return { valid: true, botName: info.displayName }
    } catch (err) {
        if (err instanceof HTTPFetchError) {
            return { valid: false, error: `LINE API Error: ${err.status}` }
        }
        return { valid: false, error: '無法連接 LINE API' }
    }
}
