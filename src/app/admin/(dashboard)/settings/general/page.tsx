import { getCurrentTenant } from '@/lib/tenant'
import { GeneralSettingsForm } from '@/features/settings/components/general-settings-form'
import { updateGeneralSettings } from './actions'

export default async function GeneralSettingsPage() {
    const tenant = await getCurrentTenant('admin')

    if (!tenant) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                找不到相關的商店設定
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">一般設定</h1>
                <p className="text-zinc-400 mt-1">管理商店的基本資訊與外觀</p>
            </div>

            <GeneralSettingsForm
                tenant={tenant}
                updateAction={updateGeneralSettings}
            />
        </div>
    )
}
