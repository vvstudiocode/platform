import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from '../settings-form'
import { updateStoreSettings } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function getUserStore(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id, tenants:tenant_id(id, name, slug, description, logo_url, settings, footer_settings)')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return data?.tenants as any
}

export default async function AppGeneralSettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/app/login')

    const store = await getUserStore(supabase, user.id)
    if (!store) redirect('/app/onboarding')

    const boundUpdateSettings = updateStoreSettings.bind(null, store.id)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app/settings" className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-foreground">一般設定</h1>
            </div>

            <SettingsForm store={store} updateAction={boundUpdateSettings} />
        </div>
    )
}
