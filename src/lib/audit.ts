import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

interface AuditLogParams {
    tenantId: string
    action: string
    entityType: string
    entityId?: string
    details?: Record<string, any>
}

/**
 * Logs a sensitive action to the audit_logs table.
 * Uses the Server Client to capture the current user, or Service Role if system action.
 */
export async function logAuditAction({
    tenantId,
    action,
    entityType,
    entityId,
    details,
}: AuditLogParams) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Get IP and User Agent
        const headersList = await headers()
        const ip = headersList.get('x-forwarded-for') || 'unknown'
        const userAgent = headersList.get('user-agent') || 'unknown'

        const { error } = await (supabase as any).from('audit_logs').insert({
            tenant_id: tenantId,
            user_id: user?.id || null, // Null means system action or unauthenticated (should be rare for audit)
            action,
            entity_type: entityType,
            entity_id: entityId,
            details: details || {},
            ip_address: ip,
            user_agent: userAgent,
        })

        if (error) {
            console.error('Failed to log audit action:', error)
        }
    } catch (err) {
        // Audit logging should not block the main application flow if it fails
        console.error('Audit logging exception:', err)
    }
}
