import { getCurrentTenant } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GeneralSettingsForm } from '@/features/settings/components/general-settings-form'
import { updateStoreSettings } from '../actions'

export default async function AppGeneralSettingsPage() {
    const tenant = await getCurrentTenant('app')
    if (!tenant) redirect('/app/login')

    const boundUpdateSettings = updateStoreSettings.bind(null, tenant.id)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app/settings" className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-foreground">一般設定</h1>
            </div>

            <GeneralSettingsForm
                tenant={tenant}
                updateAction={boundUpdateSettings}
            />
        </div>
    )
}
