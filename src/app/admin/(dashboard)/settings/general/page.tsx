import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { GeneralSettingsForm } from './general-settings-form'

export default async function GeneralSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. 嘗試從 users_roles 找到關聯的 tenant
    // 1. Check if super_admin first
    const { data: superAdminRole } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .maybeSingle()

    let tenant = null

    if (superAdminRole) {
        // If super admin, try to find 'hq' tenant
        const { data: hqTenant } = await supabase
            .from('tenants')
            .select('*')
            .eq('is_hq', true)
            .maybeSingle()

        if (hqTenant) {
            tenant = hqTenant
        }
    }

    // Fallback: Use existing logic if not super admin or hq not found
    if (!tenant) {
        const { data: userRole } = await supabase
            .from('users_roles')
            .select('tenant_id')
            .eq('user_id', user.id)
            .neq('role', 'super_admin') // Avoid picking up the super admin role again if possible, though strict equality above handles it
            .maybeSingle()

        if (userRole?.tenant_id) {
            const { data } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', userRole.tenant_id)
                .single()
            tenant = data
        } else {
            const { data } = await supabase
                .from('tenants')
                .select('*')
                .eq('managed_by', user.id)
                .maybeSingle() // changed to maybeSingle to avoid error if multiple
            tenant = data
        }
    }

    if (!tenant) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                找不到相關的商店設定 (User ID: {user.id})
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">一般設定</h1>
                <p className="text-muted-foreground mt-1">管理商店的基本資訊與外觀</p>
            </div>

            <GeneralSettingsForm tenant={tenant} />
        </div>
    )
}
