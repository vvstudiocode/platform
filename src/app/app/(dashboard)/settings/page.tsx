import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'
import { updateStoreSettings } from './actions'

async function getUserStore(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id, tenants:tenant_id(id, name, slug, description, logo_url, settings, footer_settings)')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return data?.tenants as any
}

export default async function AppSettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/app/login')

    const store = await getUserStore(supabase, user.id)
    if (!store) redirect('/app/onboarding')

    const boundUpdateSettings = updateStoreSettings.bind(null, store.id)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-white">商店設定</h1>
            <SettingsForm store={store} updateAction={boundUpdateSettings} />
        </div>
    )
}
