'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 更新商店設定
export async function updateStoreSettings(storeId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const planId = formData.get('plan_id') as string
    const subscriptionStatus = formData.get('subscription_status') as string
    const nextBillingAt = formData.get('next_billing_at') as string

    // Auto-billing fields
    const shouldGenerateBilling = formData.get('generate_billing') === 'true'
    const billingAmount = parseFloat(formData.get('billing_amount') as string || '0')
    const billingDescription = formData.get('billing_description') as string || ''

    // 構建更新物件
    const updates: any = {
        plan_id: planId,
        subscription_status: subscriptionStatus,
        subscription_tier: planId, // 保持向後相容
    }

    // 當日期為空字串時，設為 null
    if (nextBillingAt) {
        updates.next_billing_at = new Date(nextBillingAt).toISOString()
    } else {
        updates.next_billing_at = null
    }

    // 更新 tenant
    const { error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', storeId)
        .eq('managed_by', user.id)

    if (error) {
        return { error: error.message }
    }

    // 自動建立帳單紀錄
    let billingCreated = false
    if (shouldGenerateBilling && billingAmount > 0) {
        const { error: billingError } = await supabase
            .from('billing_transactions')
            .insert({
                tenant_id: storeId,
                transaction_type: 'subscription_charge',
                amount: billingAmount,
                fee_amount: 0,
                provider: 'admin_manual',
                provider_transaction_id: `ADMIN-${Date.now()}`,
                order_id: null,
                occurred_at: new Date().toISOString(),
                description: billingDescription || `[後台升級] 方案升級`,
            })

        if (billingError) {
            // 方案已更新成功，但帳單建立失敗 -> 回傳警告
            return { success: true, billingCreated: false, warning: `方案已更新，但帳單建立失敗: ${billingError.message}` }
        }
        billingCreated = true
    }

    revalidatePath(`/admin/stores/${storeId}/settings`)
    return { success: true, billingCreated }
}

// 刪除商店
export async function deleteStore(storeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    // 先刪除相關資料
    // 1. 刪除商店的頁面
    await supabase.from('pages').delete().eq('tenant_id', storeId)

    // 2. 刪除商店的商品
    await supabase.from('products').delete().eq('tenant_id', storeId)

    // 3. 刪除商店的訂單項目和訂單
    const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('tenant_id', storeId)

    if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id)
        await supabase.from('order_items' as any).delete().in('order_id', orderIds)
        await supabase.from('orders').delete().eq('tenant_id', storeId)
    }

    // 4. 刪除用戶角色
    await supabase.from('users_roles').delete().eq('tenant_id', storeId)

    // 5. 刪除導覽項目
    await supabase.from('nav_items').delete().eq('tenant_id', storeId)

    // 6. 最後刪除商店本身
    const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', storeId)
        .eq('managed_by', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/stores')
    redirect('/admin/stores')
}
