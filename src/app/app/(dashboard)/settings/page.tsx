import { getCurrentTenant } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { SettingsMenu } from '@/features/settings/components/settings-menu'

export default async function AppSettingsPage() {
    const tenant = await getCurrentTenant('app')
    if (!tenant) redirect('/app/login')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">商店設定</h1>
                <p className="text-muted-foreground mt-1">管理您的商店資訊與商品屬性</p>
            </div>

            <SettingsMenu basePath="/app/settings" />
        </div>
    )
}
