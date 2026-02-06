import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'
import { updateStoreSettings } from './actions'
import { Settings, Database } from 'lucide-react'
import Link from 'next/link'

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

    const settingSections = [
        {
            icon: Settings,
            title: '一般設定',
            description: '商店基本資訊與配置',
            href: '/app/settings/general'
        },
        {
            icon: Database,
            title: '品牌管理',
            description: '管理商品品牌列表',
            href: '/app/settings/brands'
        },
        {
            icon: Database,
            title: '分類管理',
            description: '管理商品分類結構',
            href: '/app/settings/categories'
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">商店設定</h1>
                <p className="text-zinc-400 mt-1">管理您的商店資訊與商品屬性</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {settingSections.map((section) => (
                    <Link key={section.title} href={section.href}>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:bg-zinc-800/50 transition-colors cursor-pointer h-full">
                            <div className="flex items-start justify-between">
                                <section.icon className="h-6 w-6 text-zinc-400" />
                            </div>
                            <h3 className="font-semibold text-white mt-4">{section.title}</h3>
                            <p className="text-sm text-zinc-500 mt-1">{section.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
