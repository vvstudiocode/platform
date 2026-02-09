import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPaymentSettings } from '@/features/payment/actions'
import { PaymentSettingsForm } from '@/features/payment/components'
import { getCurrentTenant } from '@/lib/tenant'

export default async function PaymentSettingsPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get current tenant
    const tenant = await getCurrentTenant('app')
    if (!tenant) redirect('/app/onboarding')

    // Get current settings
    const settings = await getPaymentSettings(tenant.id)

    return (
        <div className="container max-w-2xl py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">收款設定</h1>
                <p className="text-muted-foreground">設定您的綠界 ECPay 金流串接資訊</p>
            </div>

            <PaymentSettingsForm
                tenantId={tenant.id}
                isHQ={false}
                initialSettings={settings}
            />
        </div>
    )
}
