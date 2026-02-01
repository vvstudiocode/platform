'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateOrderStatus(storeId: string, orderId: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('未登入')
    }

    const { error } = await supabase
        .from('orders')
        .update({
            status,
            ...(status === 'paid' ? { paid_at: new Date().toISOString() } : {}),
            ...(status === 'shipped' ? { shipped_at: new Date().toISOString() } : {}),
        })
        .eq('id', orderId)
        .eq('tenant_id', storeId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/admin/stores/${storeId}/orders`)
    revalidatePath(`/admin/stores/${storeId}/orders/${orderId}`)
}
