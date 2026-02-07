import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

interface AnalyticsEventParams {
    tenantId: string
    eventType: string
    pagePath?: string
    visitorId?: string
    meta?: Record<string, any>
}

export async function trackEvent({
    tenantId,
    eventType,
    pagePath,
    visitorId,
    meta,
}: AnalyticsEventParams) {
    try {
        // Use service role or standard client? 
        // Since this is often called from public pages where no user is logged in,
        // we need to ensure we can write. 
        // Ideally we use a restricted client or just the standard server client handled by middleware.
        // However, for public page views, we might not have a session.
        // Let's use createClient() but we might need service role if RLS blocks public inserts.
        // Our migration said: "Policy: No public insert policy... Strategy: We will use a Server Action".
        // So we need a client that can bypass RLS for INSERTS, or we need to enable public inserts.
        // For SECURITY, keeping inserts restricted to Server Actions is safer.
        // Since createClient() in /lib/supabase/server uses the user's session (or anon), 
        // and we DID NOT add an insert policy for anon, we MUST use Service Role here?
        // Actually, `createClient` in `lib/supabase/server.ts` imports `createServerClient` which respects cookies.
        // If the user is ANON, they have no role.
        // So, to write to `analytics_events` (which has no public insert policy), we must use a Service Role client.

        // TEMPORARY: We will use the standard client for now, but we'll need to update the migration 
        // OR create a `createAdminClient` implementation if standard client fails.
        // WAITING: I'll stick to the standard client first. If RLS blocks, I'll add a 'service_role' client.
        // UPDATE: To ensure this works reliably without exposing RLS, I will use a direct Service Role client construction here
        // strictly for this analytics purpose, avoiding global exposure.

        // BUT, the safer way aligned with our Supabase Architect skill is to avoid random service_role usage.
        // Let's rely on the Server Action context. 
        // If I use `createClient()`, it acts as the user (or Anon). 
        // My migration has NO INSERT POLICY for Anon. 
        // So this WILL FAIL for public visitors.

        // FIX: I will modify this file to use `createAdminClient` equivalent or just import `createClient` and request the user to allow public inserts?
        // User asked for "Security". 
        // Best practice: Server Action uses Service Role to log analytics, so clients can't spam.

        // I will construct a local admin client for this specific system function.

        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')

        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error } = await (supabaseAdmin as any).from('analytics_events').insert({
            tenant_id: tenantId,
            event_type: eventType,
            page_path: pagePath,
            visitor_id: visitorId,
            meta: meta || {},
        })

        if (error) {
            console.error('Analytics tracking error:', error)
        }
    } catch (err) {
        console.error('Analytics exception:', err)
    }
}
