import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DomainSettingsClient } from './client'

export default async function DomainSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // Get Tenant
    const { data: userRole } = await supabase
        .from('users_roles')
        .select(`
            tenants(
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

    if (!tenant) {
        // Fallback checks for HQ / Managed Tenants
        const { data: managedTenant } = await supabase
            .from('tenants')
            .select(`
                *,
                plans (
                    features
                )
            `)
            .eq('managed_by', user.id)
            .single()

        if (managedTenant) tenant = managedTenant
    }

    if (!tenant) redirect('/app')

    // Check Plan Permission
    const planFeatures = tenant.plans?.features || {}
    if (!planFeatures.custom_domain) {
        return (
            <div className="max-w-2xl">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground mb-2">自訂網域</h2>
                    <p className="text-muted-foreground">設定您的專屬品牌網址 (Custom Domain)。</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-8 text-center shadow-soft">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">升級以解鎖自訂網域</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        自訂網域功能僅提供給成長方案 (Growth) 以上的用戶。
                        <br />
                        升級方案，讓您的商店擁有更專業的品牌形象。
                    </p>
                    <a
                        href="/app/settings/billing"
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-sm"
                    >
                        前往升級方案
                    </a>
                </div>
            </div>
        )
    }

    return (
        <DomainSettingsClient currentDomain={tenant.custom_domain} />
    )
}
