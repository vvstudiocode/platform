'use server'

import { trackEvent } from '@/lib/analytics'
import { headers } from 'next/headers'

export async function recordPageView(tenantId: string, path: string) {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || 'unknown'
    const referer = headersList.get('referer') || 'unknown'

    // Simple visitor ID based on IP + UA hash could be done, but for now we might rely on client-side ID passed later?
    // Current trackEvent takes visitorId. Let's just log "anonymous" for now or handle it on client.
    // Client side is better for session ID.
    // However, server action is easiest to just fire from useEffect.

    await trackEvent({
        tenantId,
        eventType: 'page_view',
        pagePath: path,
        visitorId: 'anonymous', // placeholder, ideally from a cookie
        meta: { userAgent, referer }
    })
}
