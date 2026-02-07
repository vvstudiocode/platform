import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'
import { updateStoreSettings } from './actions'
import { Settings, Database, CreditCard, Globe } from 'lucide-react'
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
        },
        {
            icon: CreditCard,
            title: '方案與訂閱',
            description: '管理商店方案、升級與帳單',
            href: '/app/settings/billing'
        },
        {
            icon: Globe,
            title: '自訂網域',
            description: '設定您的專屬網址',
            href: '/app/settings/domain'
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-serif font-bold text-foreground">商店設定</h1>
                <p className="text-muted-foreground mt-1">管理您的商店資訊與商品屬性</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {settingSections.map((section) => (
                    <Link key={section.title} href={section.href}>
                        <div className="rounded-xl border border-border bg-card p-6 hover:bg-muted/50 transition-colors cursor-pointer h-full shadow-sm hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <section.icon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-serif font-semibold text-foreground mt-4">{section.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
