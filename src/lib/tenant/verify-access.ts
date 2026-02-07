import { createClient } from '@/lib/supabase/server'

/**
 * 驗證用戶是否有權限操作指定的 Tenant
 * @param tenantId - 目標 Tenant ID
 * @returns 是否有權限
 */
export async function verifyTenantAccess(tenantId: string): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false
    if (!tenantId) return false

    // 策略 1: 檢查 users_roles
    const { data: userRole } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('tenant_id', tenantId)
        .in('role', ['store_owner', 'store_admin'])
        .maybeSingle()

    if (userRole) return true

    // 策略 2: 檢查是否為 HQ tenant（Super Admin）
    const { data: hqTenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', tenantId)
        .eq('is_hq', true)
        .single()

    if (hqTenant) return true

    // 策略 3: 檢查 managed_by
    const { data: managedTenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', tenantId)
        .eq('managed_by', user.id)
        .single()

    if (managedTenant) return true

    return false
}

/**
 * 獲取 User ID（用於需要 user ID 的場景）
 */
export async function getCurrentUserId(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
}

/**
 * 獲取 User Email
 */
export async function getCurrentUserEmail(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email || null
}
