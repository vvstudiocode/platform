'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// 取得總部商店 ID
async function getHQStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('tenants')
        .select('id')
        .or(`slug.eq.hq,managed_by.eq.${userId}`)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    return data?.id
}

// 新增導覽項目
export async function addNavItem(pageId: string, title: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '請先登入' }

    const hqStoreId = await getHQStoreId(supabase, user.id)
    if (!hqStoreId) return { error: '找不到總部商店' }

    // 取得目前最大 position
    const { data: maxItem } = await supabase
        .from('nav_items')
        .select('position')
        .eq('tenant_id', hqStoreId)
        .order('position', { ascending: false })
        .limit(1)
        .single()

    const nextPosition = (maxItem?.position ?? -1) + 1

    const { error } = await supabase
        .from('nav_items')
        .insert({
            tenant_id: hqStoreId,
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

    revalidatePath('/admin/navigation')
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

    revalidatePath('/admin/navigation')
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

    revalidatePath('/admin/navigation')
    return { success: true }
}

// 更新導覽項目標題
export async function updateNavItemTitle(navItemId: string, title: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('nav_items')
        .update({ title })
        .eq('id', navItemId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/navigation')
    return { success: true }
}
