'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ecpay } from '@/lib/payments/ecpay'
import { verifyTenantAccess, getCurrentUserEmail } from '@/lib/tenant'

// Bind Credit Card (Get Token)
export async function bindCreditCard(
    tenantId: string,
    isHQ: boolean,
    prevState: any,
    formData: FormData
) {
    const supabase = await createClient()

    // 1. 權限驗證
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized: You do not have permission.' }

    // 2. 獲取用戶 Email
    const email = await getCurrentUserEmail() || 'user@example.com'

    // 3. 生成 ECPay 參數
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const returnUrl = `${siteUrl}/api/ecpay/return`
    const clientRedirect = isHQ ? '/admin/settings/billing' : '/app/settings/billing'

    const ecpayParams = ecpay.createCardBindingParams(tenantId, email, returnUrl, clientRedirect)

    return {
        success: true,
        ecpayParams,
        ecpayUrl: `${ecpay.apiUrl}/Cashier/AioCheckOut/V5`
    }
}

// Upgrade / Change Plan
export async function updateSubscription(
    tenantId: string,
    planId: string,
    isHQ: boolean
) {
    const supabase = await createClient()

    // 1. 權限驗證
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized: You do not have permission.' }

    // 2. 獲取 Tenant 詳情
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single()

    if (!tenant) return { error: 'Tenant not found' }

    // 3. 獲取 Plan 詳情
    const { data: plan } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single()

    if (!plan) return { error: 'Plan not found' }

    try {
        // CASE A: Tenant 沒有綁定信用卡 -> 觸發綁定流程
        if (!tenant.ecpay_card_id || !tenant.ecpay_card_id.startsWith('BOUND')) {
            const email = await getCurrentUserEmail() || 'user@example.com'
            const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
            const returnUrl = `${siteUrl}/api/ecpay/return`
            const clientRedirect = isHQ ? '/admin/settings/billing' : '/app/settings/billing'

            const ecpayParams = ecpay.createCardBindingParams(
                tenant.id,
                email,
                returnUrl,
                clientRedirect,
                planId
            )

            return {
                success: false,
                requiresBinding: true,
                ecpayParams,
                ecpayUrl: `${ecpay.apiUrl}/Cashier/AioCheckOut/V5`
            }
        }

        // CASE B: Tenant 已綁定信用卡 -> 直接扣款升級
        if (plan.price_monthly > 0) {
            await supabase.from('billing_transactions').insert({
                tenant_id: tenant.id,
                transaction_type: 'subscription_charge',
                amount: plan.price_monthly,
                fee_amount: 0,
                provider: 'ecpay',
                provider_transaction_id: `SIM-${Date.now()}`,
                order_id: null,
                occurred_at: new Date().toISOString(),
                description: `${plan.name} (月費)`
            })
        }

        // 更新 Tenant 方案
        await supabase
            .from('tenants')
            .update({
                plan_id: planId,
                subscription_status: 'active',
                next_billing_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', tenant.id)

        // 重新驗證路徑
        revalidatePath(isHQ ? '/admin/settings/billing' : '/app/settings/billing')
        return { success: true }

    } catch (e: any) {
        return { error: e.message || '更新方案失敗' }
    }
}

// Unbind Credit Card
export async function unbindCreditCard(tenantId: string, isHQ: boolean) {
    const supabase = await createClient()

    // 1. 權限驗證
    const hasAccess = await verifyTenantAccess(tenantId)
    if (!hasAccess) return { error: 'Unauthorized' }

    try {
        await supabase
            .from('tenants')
            .update({ ecpay_card_id: null })
            .eq('id', tenantId)

        revalidatePath(isHQ ? '/admin/settings/billing' : '/app/settings/billing')
        return { success: true }
    } catch (e: any) {
        return { error: e.message || '移除信用卡失敗' }
    }
}

// Get Billing History
export async function getBillingHistory(tenantId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('billing_transactions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('occurred_at', { ascending: false })

    return data || []
}

// Get All Plans
export async function getAllPlans() {
    // Return hardcoded plans to match the new pricing structure
    return [
        {
            id: 'starter',
            name: 'Starter 入門版',
            price_monthly: 0,
            transaction_fee_percent: 0,
            storage_limit_mb: 50,
            description: '適合剛開始經營的品牌'
        },
        {
            id: 'growth',
            name: 'Growth 進階版',
            price_monthly: 299,
            transaction_fee_percent: 0,
            storage_limit_mb: 1024,
            description: '適合高速成長的品牌'
        },
        {
            id: 'roadmap',
            name: 'Roadmap 未來擴充',
            price_monthly: -1, // Special value for 'Commig Soon'
            transaction_fee_percent: 0,
            storage_limit_mb: 0,
            description: '敬請期待更多強大功能'
        }
    ]
}

// Get Transaction Count
export async function getTransactionCount(tenantId: string) {
    const supabase = await createClient()
    const { count } = await supabase
        .from('billing_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)

    return count || 0
}
