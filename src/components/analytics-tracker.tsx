'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { recordPageView } from '@/app/actions/analytics'

export function AnalyticsTracker({ tenantId }: { tenantId: string }) {
    const pathname = usePathname()

    useEffect(() => {
        if (tenantId) {
            recordPageView(tenantId, pathname)
        }
    }, [pathname, tenantId])

    return null
}
