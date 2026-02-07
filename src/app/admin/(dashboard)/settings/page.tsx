import { getCurrentTenant } from '@/lib/tenant'
import { SettingsMenu } from '@/features/settings/components/settings-menu'

export default async function SettingsPage() {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return null

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">商店設定</h1>
                <p className="text-zinc-400 mt-1">管理商店的全域設定</p>
            </div>

            <SettingsMenu basePath="/admin/settings" />
        </div>
    )
}
