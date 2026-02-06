'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient()

    const updateData: Record<string, any> = { status }

    if (status === 'paid') {
        updateData.payment_status = 'paid'
        updateData.paid_at = new Date().toISOString()
    } else if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString()
    } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/app/orders')
    revalidatePath(`/app/orders/${orderId}`)
    return { success: true }
}

export async function deleteOrder(storeId: string | null, orderId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: '請先登入' }
    }

    // Permission check - verify user owns this store
    if (storeId) {
        const { data: role } = await supabase
            .from('users_roles')
            .select('tenant_id')
            .eq('user_id', user.id)
            .eq('tenant_id', storeId)
            .in('role', ['store_owner', 'store_admin'])
            .single()

        if (!role) {
            return { error: '無權限' }
        }
    }

    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/app/orders')
    return { success: true }
}

export async function updateOrder(storeId: string | null, orderId: string, data: any) {
    const supabase = await createClient()

    const {
        customerName, customerPhone, customerEmail,
        shippingMethod, shippingFee, storeName, storeCode, storeAddress,
        notes, total, subtotal, items: newItems,
        discountType, discountValue
    } = data

    const updatePayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        shipping_method: shippingMethod,
        shipping_fee: shippingFee,
        store_name: storeName,
        store_code: storeCode,
        store_address: storeAddress,
        items: newItems,
        subtotal: subtotal,
        total: total,
        total_amount: total,
        notes: notes,
        discount_type: discountType,
        discount_value: discountValue
    }

    const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/app/orders')
    revalidatePath(`/app/orders/${orderId}`)
    return { success: true }
}
