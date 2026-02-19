import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentTenant } from '@/lib/tenant'
import { DomainSettingsClient } from '@/app/app/(dashboard)/settings/domain/client'

export default async function AdminDomainSettingsPage() {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) redirect('/admin/login')

    const supabase = await createClient()

    // Get Full Tenant Data with Plans
    const { data: fullTenant } = await supabase
        .from('tenants')
        .select(`
            *,
            plans (
                features
            )
        `)
        .eq('id', tenant.id)
        .single()

    if (!fullTenant) redirect('/admin/settings')

    // Check Plan Permission
    const planFeatures = (fullTenant.plans as any)?.features || {}
    const isAdvanced = fullTenant.plan_id === 'growth' || fullTenant.plan_id === 'enterprise'

    if (!planFeatures.custom_domain && !isAdvanced) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-foreground">自訂網域</h2>
                    <p className="text-muted-foreground">設定您的專屬品牌網址 (Custom Domain)。</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">升級以解鎖自訂網域</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        自訂網域功能僅提供給成長方案 (Growth) 以上的用戶。
                        升級方案，讓您的商店擁有更專業的品牌形象。
                    </p>
                    <a
                        href="/admin/settings/billing"
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        前往升級方案
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">自訂網域</h1>
                <p className="text-muted-foreground mt-1">設定您的專屬品牌網址，提升品牌形象與 SEO。</p>
            </div>
            <DomainSettingsClient currentDomain={fullTenant.custom_domain} />
        </div>
    )
}
