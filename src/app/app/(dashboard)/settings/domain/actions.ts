'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { zeabur } from '@/lib/zeabur'

export async function bindCustomDomain(domain: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // 1. Get Tenant
    // 1. Get Tenant with Plan Features
    const { data: userRole } = await supabase
        .from('users_roles')
        .select(`
            tenant_id, 
            tenants (
                *,
                plans (
                    features
                )
            )
        `)
        .eq('user_id', user.id)
        .in('role', ['store_owner', 'store_admin'])
        .maybeSingle()

    let tenant: any = null
    if (userRole?.tenants) {
        tenant = Array.isArray(userRole.tenants) ? userRole.tenants[0] : userRole.tenants
    }

    if (!tenant) return { error: 'Tenant not found' }

    // Check Plan Permission
    const planFeatures = tenant.plans?.features || {}
    if (!planFeatures.custom_domain) {
        return { error: '您的方案不支援自訂網域功能，請升級方案。' }
    }

    try {
        // 2. Clear old domain if needed? 
        // Zeabur allows multiple? Usually we just bind the new one.
        // If we want to replace, we might need to unbind old one but let's just bind new for now.

        // 3. Call Zeabur API
        const result = await zeabur.bindDomain(domain)
        if (!result.success) {
            throw new Error(result.error || 'Failed to bind domain on Zeabur')
        }

        // 4. Update DB
        const { error } = await supabase
            .from('tenants')
            .update({ custom_domain: domain })
            .eq('id', tenant.id)

        if (error) throw error

        revalidatePath('/app/settings/domain')
        return { success: true, dnsRecords: result.dnsRecords }

    } catch (e: any) {
        console.error('Bind Domain Error:', e)
        return { error: e.message || '設定失敗' }
    }
}

export async function removeCustomDomain() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get Tenant... (Simplifying repetition)
    if (!user) return { error: 'Unauthorized' }
    const { data: userRole } = await supabase.from('users_roles').select('tenant_id').eq('user_id', user.id).maybeSingle()
    if (!userRole?.tenant_id) return { error: 'Unauthorized' }

    // Update DB Only? Or Call Zeabur Unbind?
    // Integrating "Unbind" requires another Zeabur method. 
    // For now, let's just clear DB so middleware stops routing it.

    await supabase.from('tenants').update({ custom_domain: null }).eq('id', userRole.tenant_id)
    revalidatePath('/app/settings/domain')
    return { success: true }
}
