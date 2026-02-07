'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { verifyTenantAccess } from '@/lib/tenant'

export async function deleteOrder(tenantId: string, orderId: string, isHQ: boolean = false) {
    const supabase = await createClient()

    // 1. 權限驗證
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized: 無權限執行此操作' }

    // 2. 執行刪除
    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
        .eq('tenant_id', tenantId) // 額外安全檢查

    if (error) {
        return { error: error.message }
    }

    if (isHQ) {
        revalidatePath('/admin/orders')
    } else {
        revalidatePath('/app/orders')
    }
    return { success: true }
}

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = await createClient()

    // 1. 獲取訂單以確認 Tenant ID
    const { data: order } = await supabase
        .from('orders')
        .select('tenant_id, payment_status')
        .eq('id', orderId)
        .single()

    if (!order) return { error: '訂單不存在' }

    // 2. 權限驗證
    if (!order.tenant_id) return { error: '訂單資料異常' }
    const hasAccess = await verifyTenantAccess(order.tenant_id)
    if (!hasAccess) return { error: 'Unauthorized: 無權限執行此操作' }

    // 3. 準備更新數據
    const updateData: Record<string, any> = { status }

    // 更新付款狀態
    if (status === 'paid' || status === 'completed') {
        updateData.payment_status = 'paid'
    }

    // 4. 執行更新
    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

    if (error) {
        return { error: error.message }
    }

    // Revalidate paths
    // Note: We don't know easily if it's admin or app calling without passing context.
    // Ideally we revalidate both or check referrer?
    // Let's revalidate both to be safe and simple.
    revalidatePath('/admin/orders')
    revalidatePath('/app/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath(`/app/orders/${orderId}`)

    return { success: true }
}

export async function updateOrder(tenantId: string, orderId: string, data: any, isHQ: boolean = false) {
    const supabase = await createClient()

    // 1. 權限驗證
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    // 2. 準備更新數據
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
        .eq('tenant_id', tenantId)

    if (error) {
        return { error: error.message }
    }

    if (isHQ) {
        revalidatePath('/admin/orders')
        revalidatePath(`/admin/orders/${orderId}`)
    } else {
        revalidatePath('/app/orders')
        revalidatePath(`/app/orders/${orderId}`)
    }

    return { success: true }
}
