'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CollapsibleSidebar } from '@/components/dashboard/collapsible-sidebar'

interface NavItem {
    href: string
    icon: string
    label: string
}

interface NavSection {
    title: string
    items: NavItem[]
}

interface Props {
    navItems?: NavItem[]
    navSections?: NavSection[]
    children: React.ReactNode
    usageData?: {
        planName: string
        storageUsageMb: number
        storageLimitMb: number
    }
}

// 圖標映射（從 CollapsibleSidebar 複製）
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FileText,
    Settings,
    Menu as MenuIcon,
    Store,
    Users,
} from 'lucide-react'

const iconMap: Record<string, any> = {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FileText,
    Settings,
    Menu: MenuIcon,
    Store,
    Users,
}

export function DashboardLayout({ navItems, navSections, children, usageData }: Props) {
    const pathname = usePathname()

    // 取得所有導覽項目（用於手機版底部導覽）
    const allItems: NavItem[] = navSections
        ? navSections.flatMap(s => s.items)
        : (navItems || [])

    return (
        <div className="flex flex-1 min-h-0">
            {/* 桌面版側邊欄 - 使用 sticky 確保固定在視窗 */}
            <CollapsibleSidebar navItems={navItems} navSections={navSections} usageData={usageData} />

            {/* 主內容區 */}
            <main className="flex-1 overflow-auto pb-16 md:pb-0">
                <div className="p-4 md:p-8 max-w-full">
                    {children}
                </div>
            </main>

            {/* 手機版底部導覽列 */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-40">
                <div className="flex justify-around items-center h-16 px-2">
                    {allItems.slice(0, 5).map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/app' && item.href !== '/admin' && pathname.startsWith(item.href))
                        const Icon = iconMap[item.icon] || LayoutDashboard

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive
                                    ? 'text-rose-400'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
