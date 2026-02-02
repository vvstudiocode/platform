'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function getUserStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return data?.tenant_id
}

// 新增導覽項目
export async function addNavItem(pageId: string, title: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const storeId = await getUserStoreId(supabase, user.id)
    if (!storeId) return { error: '找不到商店' }

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

    revalidatePath('/app/navigation')
    return { success: true }
}

// 刪除導覽項目
export async function removeNavItem(navItemId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('nav_items')
        .delete()
        .eq('id', navItemId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/app/navigation')
    return { success: true }
}

// 更新排序（拖拉後）
export async function updateNavOrder(items: { id: string; position: number }[]) {
    const supabase = await createClient()

    // 批次更新所有項目的 position
    for (const item of items) {
        await supabase
            .from('nav_items')
            .update({ position: item.position })
            .eq('id', item.id)
    }

    revalidatePath('/app/navigation')
    return { success: true }
}
