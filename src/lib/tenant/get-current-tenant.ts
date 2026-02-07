import { createClient } from '@/lib/supabase/server'
import { TenantContext, TenantContextType } from './types'

/**
 * 統一獲取當前 Tenant 的函數
 * @param context - 'admin' 表示總部，'app' 表示子網站
 * @returns TenantContext 或 null（如果未找到）
 */
export async function getCurrentTenant(
    context: TenantContextType
): Promise<TenantContext | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    if (context === 'admin') {
        return await getHQTenant(supabase, user.id)
    } else {
        return await getUserStoreTenant(supabase, user.id)
    }
}

/**
 * 獲取總部 (HQ) Tenant
 */
async function getHQTenant(supabase: any, userId: string): Promise<TenantContext | null> {
    // 策略 A: 從 users_roles 獲取
    const { data: userRole } = await supabase
        .from('users_roles')
        .select(`
            tenant_id,
            tenants:tenant_id (
                id, name, slug, settings, is_hq,
                plan_id, ecpay_card_id, next_billing_at,
                storage_usage_mb, subscription_status
            )
        `)
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .maybeSingle()

    if (userRole?.tenants) {
        const tenant = Array.isArray(userRole.tenants) ? userRole.tenants[0] : userRole.tenants
        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            isHQ: tenant.is_hq || false,
            settings: tenant.settings,
            plan_id: tenant.plan_id,
            ecpay_card_id: tenant.ecpay_card_id,
            next_billing_at: tenant.next_billing_at,
            storage_usage_mb: tenant.storage_usage_mb,
            subscription_status: tenant.subscription_status,
        }
    }

    // 策略 B: Fallback 到 is_hq=true 的 tenant
    const { data: hqTenant } = await supabase
        .from('tenants')
        .select(`
            id, name, slug, settings, is_hq,
            plan_id, ecpay_card_id, next_billing_at,
            storage_usage_mb, subscription_status
        `)
        .eq('is_hq', true)
        .single()

    if (hqTenant) {
        return {
            id: hqTenant.id,
            name: hqTenant.name,
            slug: hqTenant.slug,
            isHQ: true,
            settings: hqTenant.settings,
            plan_id: hqTenant.plan_id,
            ecpay_card_id: hqTenant.ecpay_card_id,
            next_billing_at: hqTenant.next_billing_at,
            storage_usage_mb: hqTenant.storage_usage_mb,
            subscription_status: hqTenant.subscription_status,
        }
    }

    return null
}

/**
 * 獲取用戶的商店 Tenant（子網站）
 */
async function getUserStoreTenant(supabase: any, userId: string): Promise<TenantContext | null> {
    // 策略 A: 從 users_roles 獲取
    const { data: userRole } = await supabase
        .from('users_roles')
        .select(`
            tenant_id,
            tenants:tenant_id (
                id, name, slug, settings, is_hq,
                plan_id, ecpay_card_id, next_billing_at,
                storage_usage_mb, subscription_status
            )
        `)
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .maybeSingle()

    if (userRole?.tenants) {
        const tenant = Array.isArray(userRole.tenants) ? userRole.tenants[0] : userRole.tenants
        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            isHQ: tenant.is_hq || false,
            settings: tenant.settings,
            plan_id: tenant.plan_id,
            ecpay_card_id: tenant.ecpay_card_id,
            next_billing_at: tenant.next_billing_at,
            storage_usage_mb: tenant.storage_usage_mb,
            subscription_status: tenant.subscription_status,
        }
    }

    // 策略 B: 從 managed_by 獲取
    const { data: managedTenant } = await supabase
        .from('tenants')
        .select(`
            id, name, slug, settings, is_hq,
            plan_id, ecpay_card_id, next_billing_at,
            storage_usage_mb, subscription_status
        `)
        .eq('managed_by', userId)
        .single()

    if (managedTenant) {
        return {
            id: managedTenant.id,
            name: managedTenant.name,
            slug: managedTenant.slug,
            isHQ: managedTenant.is_hq || false,
            settings: managedTenant.settings,
            plan_id: managedTenant.plan_id,
            ecpay_card_id: managedTenant.ecpay_card_id,
            next_billing_at: managedTenant.next_billing_at,
            storage_usage_mb: managedTenant.storage_usage_mb,
            subscription_status: managedTenant.subscription_status,
        }
    }

    return null
}
