import { getCurrentTenant } from '@/lib/tenant'
import { SettingsMenu } from '@/features/settings/components/settings-menu'

export default async function SettingsPage() {
    const tenant = await getCurrentTenant('admin')
    if (!tenant) return null

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">系統設定</h1>
                <p className="text-muted-foreground mt-1">管理總部商店的全域設定</p>
            </div>

            <SettingsMenu basePath="/admin/settings" />
        </div>
    )
}

