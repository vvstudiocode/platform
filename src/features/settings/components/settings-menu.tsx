'use client'

import Link from 'next/link'
import { Settings, Database, CreditCard, Globe, Wallet, Users, MessageSquare } from 'lucide-react'

interface Props {
    basePath: string // '/admin/settings' or '/app/settings'
}

export function SettingsMenu({ basePath }: Props) {
    const settingSections = [
        {
            icon: Settings,
            title: '一般設定',
            description: '商店基本資訊與配置',
            href: `${basePath}/general`
        },
        {
            icon: Database,
            title: '品牌管理',
            description: '管理商品品牌列表',
            href: `${basePath}/brands`
        },
        {
            icon: Database,
            title: '分類管理',
            description: '管理商品分類結構',
            href: `${basePath}/categories`
        },
        {
            icon: Wallet,
            title: '收款設定',
            description: '設定綠界 ECPay 金流串接',
            href: `${basePath}/payment`
        },
        {
            icon: CreditCard,
            title: '方案與訂閱',
            description: '管理商店方案、升級與帳單',
            href: `${basePath}/billing`
        },
        {
            icon: Globe,
            title: '自訂網域',
            description: '設定您的專屬網址',
            href: `${basePath}/domain`
        },
        {
            icon: Users,
            title: '會員管理',
            description: '管理會員名單、等級與點數機制',
            href: `${basePath}/members`
        },
        {
            icon: MessageSquare,
            title: 'LINE Bot',
            description: '串接 LINE 官方帳號與群組喊單功能',
            href: `${basePath}/line`
        },
        {
            icon: Settings, // using Settings icon again or Search icon
            title: 'SEO分析',
            description: '設定 GA4 與 Search Console',
            href: `${basePath}/seo`
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {settingSections.map((section) => (
                <Link key={section.title} href={section.href}>
                    <div className="rounded-xl border border-border bg-card p-6 hover:bg-muted/50 transition-colors cursor-pointer h-full shadow-sm hover:shadow-md group">
                        <div className="flex items-start justify-between">
                            <section.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-serif font-semibold text-foreground mt-4 group-hover:text-primary transition-colors">{section.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                    </div>
                </Link>
            ))}
        </div>
    )
}
