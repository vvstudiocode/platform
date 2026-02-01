'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// 建立擁有者帳號
export async function createOwnerAccount(storeId: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '未登入' }

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: '請填寫 Email 和密碼' }
    }

    if (password.length < 6) {
        return { error: '密碼至少 6 個字元' }
    }

    // 使用 Admin API 建立使用者
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!serviceRoleKey) {
        return { error: '系統設定錯誤：缺少 Service Role Key' }
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    // 建立使用者
    const { data: newUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    })

    if (createUserError) {
        if (createUserError.message.includes('already registered')) {
            return { error: '此 Email 已被註冊' }
        }
        return { error: `建立帳號失敗：${createUserError.message}` }
    }

    // 更新商店的 owner_id
    const { error: updateError } = await supabase
        .from('tenants')
        .update({ owner_id: newUser.user.id })
        .eq('id', storeId)

    if (updateError) {
        return { error: `更新商店失敗：${updateError.message}` }
    }

    // 建立 users_roles 關聯
    const { error: roleError } = await supabase
        .from('users_roles')
        .insert({
            user_id: newUser.user.id,
            tenant_id: storeId,
            role: 'store_owner',
        })

    if (roleError) {
        console.error('建立角色關聯失敗:', roleError)
    }

    revalidatePath(`/admin/stores/${storeId}`)
    return { success: true }
}

// 重設擁有者密碼
export async function resetOwnerPassword(storeId: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '未登入' }

    const newPassword = formData.get('new_password') as string

    if (!newPassword || newPassword.length < 6) {
        return { error: '密碼至少 6 個字元' }
    }

    // 取得商店的擁有者 ID
    const { data: store } = await supabase
        .from('tenants')
        .select('owner_id')
        .eq('id', storeId)
        .single()

    if (!store?.owner_id) {
        return { error: '此商店尚未設定擁有者' }
    }

    // 使用 Admin API 更新密碼
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!serviceRoleKey) {
        return { error: '系統設定錯誤：缺少 Service Role Key' }
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
        store.owner_id,
        { password: newPassword }
    )

    if (updateError) {
        return { error: `重設密碼失敗：${updateError.message}` }
    }

    revalidatePath(`/admin/stores/${storeId}`)
    return { success: true }
}

// 刪除商店
export async function deleteStore(storeId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '未登入' }

    const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', storeId)
        .eq('managed_by', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/stores')
    return { success: true }
}
