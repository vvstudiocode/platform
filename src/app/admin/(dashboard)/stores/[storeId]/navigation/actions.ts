'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// 新增導覽項目
export async function addStoreNavItem(storeId: string, pageId: string, title: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    // 驗證權限
    const { data: store } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', storeId)
        .eq('managed_by', user.id)
        .single()

    if (!store) return { error: '無權限管理此商店' }

    // 取得目前最大 position
    const { data: maxItem } = await supabase
        .from('nav_items')
        .select('position')
        .eq('tenant_id', storeId)
        .order('position', { ascending: false })
        .limit(1)
        .single()

    const nextPosition = (maxItem?.position ?? -1) + 1

    const { error } = await supabase
        .from('nav_items')
        .insert({
            tenant_id: storeId,
            page_id: pageId,
            title,
            position: nextPosition,
        })

    if (error) {
        if (error.code === '23505') {
            return { error: '此頁面已在導覽中' }
        }
        return { error: error.message }
    }

    revalidatePath(`/admin/stores/${storeId}/navigation`)
    return { success: true }
}

// 刪除導覽項目
export async function removeStoreNavItem(storeId: string, navItemId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('nav_items')
        .delete()
        .eq('id', navItemId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/stores/${storeId}/navigation`)
    return { success: true }
}

// 更新排序（拖拉後）
export async function updateStoreNavOrder(storeId: string, items: { id: string; position: number; parent_id: string | null }[]) {
    const supabase = await createClient()

    // 批次更新所有項目的 position 和 parent_id
    for (const item of items) {
        await supabase
            .from('nav_items')
            .update({
                position: item.position,
                parent_id: item.parent_id
            })
            .eq('id', item.id)
    }

    revalidatePath(`/admin/stores/${storeId}/navigation`)
    return { success: true }
}
