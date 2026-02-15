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

    const { error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', storeId)
        .eq('managed_by', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/stores/${storeId}/settings`)
    return { success: true }
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
