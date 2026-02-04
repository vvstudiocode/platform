import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { GeneralSettingsForm } from './general-settings-form'

export default async function GeneralSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 取得商店資訊 (HQ 或 Store Owner)
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('managed_by', user.id)
        .single()

    if (!tenant) {
        return (
            <div className="p-8 text-center text-zinc-500">
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

            <GeneralSettingsForm tenant={tenant} />
        </div>
    )
}
