'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ecpay } from '@/lib/payments/ecpay'
import { emailService } from '@/lib/email'

// Bind Credit Card (Get Token)
// Unified signature: (tenantId, prevState, formData) to match sub-site
export async function bindCreditCard(tenantId: string, prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    if (!tenantId) return { error: 'Tenant ID is required' }

    // 1. Verify User Permission for this Tenant
    const { data: userRole } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('tenant_id', tenantId)
        .in('role', ['store_owner', 'store_admin'])
        .maybeSingle()

    let hasPermission = !!userRole

    // If no role, check if HQ tenant (Super Admin context)
    if (!hasPermission) {
        const { data: hqTenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('id', tenantId)
            .eq('is_hq', true)
            .single()
        if (hqTenant) hasPermission = true
    }

    if (!hasPermission) return { error: 'Unauthorized: You do not have permission.' }

    // 2. Generate ECPay params for card binding
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const returnUrl = `${siteUrl}/api/ecpay/return`

    // Determine redirect: check if this is HQ
    const { data: tenant } = await supabase
        .from('tenants')
        .select('is_hq')
        .eq('id', tenantId)
        .single()

    const isHq = tenant?.is_hq
    const clientRedirect = isHq ? '/admin/settings/billing' : '/app/settings/billing'

    const ecpayParams = ecpay.createCardBindingParams(tenantId, user.email || 'user@example.com', returnUrl, clientRedirect)

    return {
        success: true,
        ecpayParams,
        ecpayUrl: `${ecpay.apiUrl}/Cashier/AioCheckOut/V5`
    }
}

// Upgrade / Change Plan
// Unified signature: (tenantId, planId) to match sub-site
export async function updateSubscription(tenantId: string, planId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    if (!tenantId) return { error: 'Tenant ID is required' }

    // 1. Verify User Permission for this Tenant
    const { data: userRole } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('tenant_id', tenantId)
        .in('role', ['store_owner', 'store_admin'])
        .maybeSingle()

    let hasPermission = !!userRole

    if (!hasPermission) {
        const { data: hqTenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('id', tenantId)
            .eq('is_hq', true)
            .single()
        if (hqTenant) hasPermission = true
    }

    if (!hasPermission) return { error: 'Unauthorized: You do not have permission.' }

    // Get Tenant Details
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single()

    if (!tenant) return { error: 'Tenant not found' }

    // Get Plan Details
    const { data: plan } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single()

    if (!plan) return { error: 'Plan not found' }

    try {
        // CASE A: Tenant has NO card -> Trigger Binding Flow
        if (!tenant.ecpay_card_id || !tenant.ecpay_card_id.startsWith('BOUND')) {
            const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
            const returnUrl = `${siteUrl}/api/ecpay/return`
            const isHq = tenant.is_hq
            // Redirect back to this page after success
            const clientRedirect = isHq ? '/admin/settings/billing' : '/app/settings/billing'

            // Pass targetPlanId to ECPay 
            const ecpayParams = ecpay.createCardBindingParams(tenant.id, user.email || 'user@example.com', returnUrl, clientRedirect, planId)

            return {
                success: false,
                requiresBinding: true,
                ecpayParams,
                ecpayUrl: `${ecpay.apiUrl}/Cashier/AioCheckOut/V5`
            }
        }

        // CASE B: Tenant HAS card -> Instant Pay & Upgrade
        // 1. Record Transaction (Activation Fee / First Month)
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

        // 2. Update Tenant Plan
        await supabase
            .from('tenants')
            .update({
                plan_id: planId,
                subscription_status: 'active',
                next_billing_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 Days
            })
            .eq('id', tenant.id)

        // Revalidate correct path based on tenant type
        if (tenant.is_hq) {
            revalidatePath('/admin/settings/billing')
        } else {
            revalidatePath('/app/settings/billing')
        }
        return { success: true }

    } catch (e: any) {
        return { error: e.message || '更新方案失敗' }
    }
}

// Unbind Credit Card (Remove Token)
// Unified signature: (tenantId) to match sub-site
export async function unbindCreditCard(tenantId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    if (!tenantId) return { error: 'Tenant ID is required' }

    // Verify Permission
    const { data: userRole } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('tenant_id', tenantId)
        .in('role', ['store_owner', 'store_admin'])
        .maybeSingle()

    let hasPermission = !!userRole

    if (!hasPermission) {
        const { data: hqTenant } = await supabase
            .from('tenants')
            .select('id, is_hq')
            .eq('id', tenantId)
            .eq('is_hq', true)
            .single()
        if (hqTenant) hasPermission = true
    }

    if (!hasPermission) return { error: 'Unauthorized' }

    try {
        // Get tenant to check if HQ
        const { data: tenant } = await supabase
            .from('tenants')
            .select('is_hq')
            .eq('id', tenantId)
            .single()

        await supabase
            .from('tenants')
            .update({ ecpay_card_id: null })
            .eq('id', tenantId)

        // Revalidate correct path
        if (tenant?.is_hq) {
            revalidatePath('/admin/settings/billing')
        } else {
            revalidatePath('/app/settings/billing')
        }
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
