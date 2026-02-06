import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { GeneralSettingsForm } from './general-settings-form'

export default async function GeneralSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. 嘗試從 users_roles 找到關聯的 tenant
    const { data: userRole } = await supabase
        .from('users_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single()

    let tenant = null

    if (userRole?.tenant_id) {
        // Find by ID from role
        const { data } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', userRole.tenant_id)
            .single()
        tenant = data
    } else {
        // Fallback: Find by managed_by
        const { data } = await supabase
            .from('tenants')
            .select('*')
            .eq('managed_by', user.id)
            .single()
        tenant = data
    }

    if (!tenant) {
        return (
            <div className="p-8 text-center text-zinc-500">
                找不到相關的商店設定 (User ID: {user.id})
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
