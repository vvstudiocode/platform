import { getCurrentTenant } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { SeoSettingsForm } from '@/features/settings/components/seo-settings-form'
import { updateSeoSettings } from '@/app/admin/(dashboard)/settings/seo/actions'
import { redirect } from 'next/navigation'

export default async function AppSeoSettingsPage() {
    const tenant = await getCurrentTenant('app')
    if (!tenant) redirect('/app/login')

    const supabase = await createClient()
    const { data: fullTenant } = await supabase
        .from('tenants')
        .select('id, settings, plan_id')
        .eq('id', tenant.id)
        .single()

    if (!fullTenant) redirect('/app/settings')

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">SEO & 分析</h1>
                <p className="text-muted-foreground mt-1">管理 Google Analytics 與 Search Console 串接設定</p>
            </div>

            {fullTenant.plan_id === 'starter' ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center shadow-sm">
                    <div className="mb-4 bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">此功能為進階版限定</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        升級至 Growth 進階版方案，即可解鎖 Google Analytics 4 與 Search Console 串接功能，掌握完整的網站流量數據。
                    </p>
                    <a href="/app/settings/billing" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        升級方案
                    </a>
                </div>
            ) : (
                <SeoSettingsForm
                    tenant={fullTenant as any}
                    updateAction={updateSeoSettings}
                />
            )}
        </div>
    )
}
