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

    // Fetch full tenant with settings
    const { data: tenantData } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', tenant.id)
        .single()

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

            <LineSettingsForm
                tenantId={tenant.id}
                isHQ={false}
                webhookUrl={webhookUrl}
                currentSettings={currentSettings}
                welcomeMessage={lineSettings.welcome_message || ''}
                groupOrderingEnabled={lineSettings.group_ordering_enabled || false}
                notifyShipped={lineSettings.notify_shipped || false}
                notifyCompleted={lineSettings.notify_completed || false}
                shippedMessage={lineSettings.shipped_message || ''}
                completedMessage={lineSettings.completed_message || ''}
                saveLineAction={boundSaveLineAction}
                saveWelcomeAction={boundSaveWelcomeAction}
            />
        </div>
    )
}
