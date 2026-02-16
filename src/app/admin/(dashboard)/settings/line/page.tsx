import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLineSettings, saveLineSettings, saveLineWelcomeMessage } from '@/features/line/actions'
import { LineSettingsForm } from '@/features/line/components/line-settings-form'
import { headers } from 'next/headers'

export default async function LineSettingsPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get HQ tenant (omo)
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, settings')
        .eq('slug', 'omo')
        .single()

    if (!tenant) redirect('/admin')

    // Get current LINE settings (masked)
    const currentSettings = await getLineSettings(tenant.id)

    // Get LINE bot settings from tenant
    const tenantSettings = (tenant.settings as Record<string, any>) || {}
    const lineSettings = tenantSettings.line || {}

    // Build webhook URL: env var first, fallback to request host
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
        const headersList = await headers()
        const host = headersList.get('host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        siteUrl = `${protocol}://${host}`
    }
    const webhookUrl = `${siteUrl}/api/webhooks/line?tenant=${tenant.id}`

    // Bind tenant ID to actions
    const boundSaveLineAction = saveLineSettings.bind(null, tenant.id, true)
    const boundSaveWelcomeAction = saveLineWelcomeMessage.bind(null, tenant.id, true)

    return (
        <div className="container max-w-2xl py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">LINE Bot 設定</h1>
                <p className="text-muted-foreground">串接 LINE 官方帳號，啟用群組喊單與自動通知功能</p>
            </div>

            <LineSettingsForm
                tenantId={tenant.id}
                isHQ={true}
                webhookUrl={webhookUrl}
                currentSettings={currentSettings}
                welcomeMessage={lineSettings.welcome_message || ''}
                groupOrderingEnabled={lineSettings.group_ordering_enabled || false}
                dmOrderingEnabled={lineSettings.dm_ordering_enabled || false}
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
