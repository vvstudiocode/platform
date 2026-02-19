'use client'

import { useEffect, useMemo } from 'react'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'

interface Props {
    tenantId: string
}

/**
 * CartHydrator
 * Automatically triggers a sync with the database if the user is logged in.
 * This ensures that the cart is consistent across Home, Member, and LINE entry points.
 */
export function CartHydrator({ tenantId }: Props) {
    const { syncWithDB, hasSynced } = useCart()
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        let cancelled = false

        async function checkUserAndSync() {
            if (hasSynced) return // Skip if already synced in this session

            const { data: { user } } = await supabase.auth.getUser()
            if (!cancelled && user) {
                console.log('[Cart Hydrator] user logged in, triggering sync...')
                await syncWithDB(tenantId)
            }
        }

        checkUserAndSync()

        return () => {
            cancelled = true
        }
    }, [tenantId, syncWithDB, hasSynced, supabase])

    return null
}
