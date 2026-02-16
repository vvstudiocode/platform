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
        .select('tenant_id, payment_status, order_number, customer_name, total_amount, customer_line_id')
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

    // 5. Send LINE notification (shipped / completed)
    if (status === 'shipped' || status === 'completed') {
        try {
            await sendLineOrderNotification(order.tenant_id, order, status)
        } catch (e) {
            // Don't block the status update if notification fails
            console.error('[LINE Notify] Failed to send notification:', e)
        }
    }

    // Revalidate paths
    revalidatePath('/admin/orders')
    revalidatePath('/app/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath(`/app/orders/${orderId}`)

    return { success: true }
}

// ============================================================
// LINE Push Notification for Order Status Changes
// ============================================================

async function sendLineOrderNotification(
    tenantId: string,
    order: { customer_line_id?: string | null; order_number?: string; customer_name?: string; total_amount?: number },
    status: string
) {
    const { createClient: createAdminSupabase } = await import('@supabase/supabase-js')
    const adminClient = createAdminSupabase(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Check tenant settings — is this notification type enabled?
    const { data: tenant } = await adminClient
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single()

    const lineSettings = (tenant?.settings as any)?.line || {}
    const shouldNotify = status === 'shipped'
        ? lineSettings.notify_shipped
        : lineSettings.notify_completed

    if (!shouldNotify) {
        console.log(`[LINE Notify] Skipping: notify_${status} is disabled for tenant`, tenantId)
        return
    }

    // 2. Find customer's LINE user ID via customer_line_id
    // The order stores the LINE ID directly from checkout
    // We also look up from customers table if it was a LINE user
    if (!order.customer_line_id) {
        console.log('[LINE Notify] No customer_line_id on order, skipping')
        return
    }

    // Look up customer by LINE ID to get their line_user_id (LINE platform user ID)
    const { data: customer } = await adminClient
        .from('customers')
        .select('line_user_id, name')
        .eq('tenant_id', tenantId)
        .eq('line_user_id', order.customer_line_id)
        .single()

    if (!customer?.line_user_id) {
        console.log('[LINE Notify] Customer not found by LINE ID, skipping')
        return
    }

    // 3. Get LINE credentials
    const encryptionKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').substring(0, 32)

    const { data: accessToken } = await adminClient.rpc('get_tenant_secret', {
        p_tenant_id: tenantId,
        p_secret_type: 'line_channel_access_token',
        p_encryption_key: encryptionKey,
    })

    if (!accessToken) {
        console.log('[LINE Notify] No LINE access token configured, skipping')
        return
    }

    // 4. Build notification message
    // 4. Build notification message
    const orderNumber = order.order_number || '未知'
    const customerName = customer.name || order.customer_name || '顧客'
    const totalAmount = order.total_amount || 0

    const formatMessage = (template: string) => {
        return template
            .replace(/{{customer}}/g, customerName)
            .replace(/{{order_number}}/g, orderNumber)
            .replace(/{{total_amount}}/g, totalAmount.toLocaleString())
    }

    let messageText = ''
    if (status === 'shipped') {
        const customMessage = lineSettings.shipped_message
        if (customMessage) {
            messageText = formatMessage(customMessage)
        } else {
            messageText = `出貨通知\n\n${customerName} 您好！\n您的訂單 #${orderNumber} 已出貨 \n\n訂單金額：NT$${totalAmount.toLocaleString()}\n\n感謝您的購買！如有問題請隨時聯繫我們。`
        }
    } else if (status === 'completed') {
        const customMessage = lineSettings.completed_message
        if (customMessage) {
            messageText = formatMessage(customMessage)
        } else {
            messageText = `訂單完成\n\n${customerName} 您好！\n您的訂單 #${orderNumber} 已完成 \n\n訂單金額：NT$${totalAmount.toLocaleString()}\n\n感謝您的支持！期待您再次光臨 💕`
        }
    }

    // 5. Send push message via LINE API
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            to: customer.line_user_id,
            messages: [{ type: 'text', text: messageText }],
        }),
    })

    if (!response.ok) {
        const errorBody = await response.text()
        console.error('[LINE Notify] Push message failed:', response.status, errorBody)
    } else {
        console.log(`[LINE Notify] Successfully sent ${status} notification to`, customer.line_user_id)
    }
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
