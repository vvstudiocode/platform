'use client'

import { useEffect } from 'react'
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
    const { syncWithDB } = useCart()
    const supabase = createClient()

    useEffect(() => {
        async function checkUserAndSync() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                console.log('[Cart Hydrator] user logged in, triggering sync...')
                await syncWithDB(tenantId)
            }
        }

        checkUserAndSync()
    }, [tenantId, syncWithDB])

    return null
}
