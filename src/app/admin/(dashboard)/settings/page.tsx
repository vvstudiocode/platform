import Link from 'next/link'
import { Settings, Bell, Shield, Database, CreditCard } from 'lucide-react'

export default function SettingsPage() {
    const settingSections = [
        {
            icon: Settings,
            title: '一般設定',
            description: '平台基本設定與配置',
            status: '已啟用',
            href: '/admin/settings/general'
        },
        {
            icon: Database,
            title: '品牌管理',
            description: '管理商品品牌列表',
            status: '已啟用',
            href: '/admin/settings/brands'
        },
        {
            icon: Database,
            title: '分類管理',
            description: '管理商品分類結構',
            status: '已啟用',
            href: '/admin/settings/categories'
        },
        {
            icon: CreditCard,
            title: '方案與訂閱',
            description: '管理平台方案、用量與帳單',
            status: '已啟用',
            href: '/admin/settings/billing'
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">系統設定</h1>
                <p className="text-zinc-400 mt-1">管理平台的全域設定</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {settingSections.map((section) => (
                    section.href ? (
                        <Link key={section.title} href={section.href}>
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 hover:bg-zinc-800/50 transition-colors cursor-pointer h-full">
                                <div className="flex items-start justify-between">
                                    <section.icon className="h-6 w-6 text-zinc-400" />
                                    <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">
                                        {section.status}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-white mt-4">{section.title}</h3>
                                <p className="text-sm text-zinc-500 mt-1">{section.description}</p>
                            </div>
                        </Link>
                    ) : (
                        <div
                            key={section.title}
                            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 opacity-60"
                        >
                            <div className="flex items-start justify-between">
                                <section.icon className="h-6 w-6 text-zinc-400" />
                                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                                    {section.status}
                                </span>
                            </div>
                            <h3 className="font-semibold text-white mt-4">{section.title}</h3>
                            <p className="text-sm text-zinc-500 mt-1">{section.description}</p>
                        </div>
                    )
                ))}
            </div>
        </div>
    )
}


