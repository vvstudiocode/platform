'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient()

    const updateData: Record<string, any> = { status }

    if (status === 'paid') {
        updateData.payment_status = 'paid'
        updateData.paid_at = new Date().toISOString()
    } else if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString()
    }

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
}
