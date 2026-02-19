'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, Database, CreditCard, Globe, Wallet, Users, MessageSquare } from 'lucide-react'
import { UpsellModal } from '@/features/page-editor/upsell-modal'

interface Props {
    basePath: string // '/admin/settings' or '/app/settings'
    currentPlanId?: string
}

export function SettingsMenu({ basePath, currentPlanId }: Props) {
    const [showUpsell, setShowUpsell] = useState(false)
    const isAdvanced = currentPlanId === 'growth'

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
            href: `${basePath}/domain`,
            requiresAdvanced: true
        },
        {
            icon: Users,
            title: '會員管理',
            description: '管理會員名單、等級與點數機制',
            href: `${basePath}/members`,
            requiresAdvanced: true
        },
        {
            icon: MessageSquare,
            title: 'LINE Bot',
            description: '串接 LINE 官方帳號與群組喊單功能',
            href: `${basePath}/line`,
            requiresAdvanced: true
        },
        {
            icon: Settings, // using Settings icon again or Search icon
            title: 'SEO分析',
            description: '設定 GA4 與 Search Console',
            href: `${basePath}/seo`,
            requiresAdvanced: true
        }
    ]

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                {settingSections.map((section) => {
                    const isDisabled = section.requiresAdvanced && !isAdvanced

                    const Content = (
                        <div className={`rounded-xl border border-border bg-card p-6 h-full shadow-sm transition-all duration-200 ${isDisabled
                            ? 'opacity-80 grayscale-[0.5] border-dashed cursor-pointer hover:border-primary/50'
                            : 'hover:bg-muted/50 cursor-pointer hover:shadow-md group'
                            }`}>
                            <div className="flex items-start justify-between">
                                <section.icon className={`h-6 w-6 transition-colors ${isDisabled ? 'text-muted-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
                                {isDisabled && (
                                    <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-600 uppercase tracking-tight">
                                        進階功能
                                    </div>
                                )}
                            </div>
                            <h3 className={`font-serif font-semibold mt-4 transition-colors ${isDisabled ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'}`}>
                                {section.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                        </div>
                    )

                    if (isDisabled) {
                        return (
                            <div key={section.title} onClick={() => setShowUpsell(true)}>
                                {Content}
                            </div>
                        )
                    }

                    return (
                        <Link key={section.title} href={section.href}>
                            {Content}
                        </Link>
                    )
                })}
            </div>

            <UpsellModal
                open={showUpsell}
                onOpenChange={setShowUpsell}
                featureName="會員管理系統"
            />
        </>
    )
}
