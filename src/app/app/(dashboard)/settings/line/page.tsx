import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLineSettings, saveLineSettings, saveLineWelcomeMessage } from '@/features/line/actions'
import { LineSettingsForm } from '@/features/line/components/line-settings-form'
import { getCurrentTenant } from '@/lib/tenant'
import { headers } from 'next/headers'

export default async function LineSettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const tenant = await getCurrentTenant('app')
    if (!tenant) redirect('/app/onboarding')

    // Fetch full tenant with settings and plan_id
    const { data: tenantData } = await supabase
        .from('tenants')
        .select('settings, plan_id')
        .eq('id', tenant.id)
        .single()

    const isStarter = tenantData?.plan_id === 'starter'
    const currentSettings = await getLineSettings(tenant.id)

    const tenantSettings = (tenantData?.settings as Record<string, any>) || {}
    const lineSettings = tenantSettings.line || {}

    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
        const headersList = await headers()
        const host = headersList.get('host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        siteUrl = `${protocol}://${host}`
    }
    const webhookUrl = `${siteUrl}/api/webhooks/line?tenant=${tenant.id}`

    const boundSaveLineAction = saveLineSettings.bind(null, tenant.id, false)
    const boundSaveWelcomeAction = saveLineWelcomeMessage.bind(null, tenant.id, false)

    return (
        <div className="container max-w-2xl py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">LINE Bot 設定</h1>
                <p className="text-muted-foreground">串接 LINE 官方帳號，啟用群組喊單與自動通知功能</p>
            </div>

            {isStarter ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
                    <div className="mb-6 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">進階版方案限定功能</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        升級至 <span className="font-bold text-foreground">Growth 進階版</span> 方案，即可開啟 LINE Bot 群組喊單、自動訂單通知等強大功能。
                    </p>
                    <a
                        href="/app/settings/billing"
                        className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-sm"
                    >
                        立即升級
                    </a>
                </div>
            ) : (
                <LineSettingsForm
                    tenantId={tenant.id}
                    isHQ={false}
                    webhookUrl={webhookUrl}
                    currentSettings={currentSettings}
                    welcomeMessage={lineSettings.welcome_message || ''}
                    lineId={lineSettings.line_id || ''}
                    groupOrderingEnabled={lineSettings.group_ordering_enabled || false}
                    dmOrderingEnabled={lineSettings.dm_ordering_enabled || false}
                    notifyShipped={lineSettings.notify_shipped || false}
                    notifyCompleted={lineSettings.notify_completed || false}
                    shippedMessage={lineSettings.shipped_message || ''}
                    completedMessage={lineSettings.completed_message || ''}
                    saveLineAction={boundSaveLineAction}
                    saveWelcomeAction={boundSaveWelcomeAction}
                    storeSlug={tenant.slug}
                />
            )}
        </div>
    )
}
