'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Package,
    ShoppingCart,
    FileText,
    Settings,
    Menu as MenuIcon,
    Store,
    Users,
    LucideIcon,
} from 'lucide-react'

// 圖示映射表
const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FileText,
    Settings,
    Menu: MenuIcon,
    Store,
    Users,
}

interface NavItem {
    href: string
    icon: string
    label: string
}

interface NavSection {
    title: string
    items: NavItem[]
}

interface UsageData {
    planName: string
    storageUsageMb: number
    storageLimitMb: number
    nextBillingAt?: string | null
}

interface Props {
    navItems?: NavItem[]
    navSections?: NavSection[]
    usageData?: UsageData
}

export function CollapsibleSidebar({ navItems, navSections, usageData }: Props) {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()

    // 如果有 navSections 就用 sections 模式，否則用 navItems
    const sections: NavSection[] = navSections || (navItems ? [{ title: '', items: navItems }] : [])

    return (
        <div className={`
            ${collapsed ? 'w-20' : 'w-48'} 
            hidden md:flex flex-shrink-0 sticky top-[4.5rem] h-[calc(100vh-4.5rem)] transition-all duration-300 relative
        `}>
            {/* 側邊欄主體 */}
            <aside className={`flex-1 border-r border-sidebar-border bg-sidebar py-4 flex flex-col ${collapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
                <nav className="space-y-4 px-2 flex-1">
                    {sections.map((section, sectionIndex) => (
                        <div key={section.title || sectionIndex}>
                            {/* 分區標題（僅在展開時顯示） */}
                            {section.title && !collapsed && (
                                <h3 className="px-3 mb-2 text-xs font-serif font-semibold text-muted-foreground uppercase tracking-wider">
                                    {section.title}
                                </h3>
                            )}
                            {/* 收合時的分隔線 */}
                            {section.title && collapsed && sectionIndex > 0 && (
                                <div className="mx-3 mb-2 border-t border-sidebar-border" />
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href ||
                                        (item.href !== '/app' && item.href !== '/admin' && pathname.startsWith(item.href))
                                    const Icon = iconMap[item.icon] || LayoutDashboard

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`group relative flex items-center gap-3 rounded-lg py-2.5 transition-all ${isActive
                                                ? 'bg-sidebar-accent text-sidebar-primary font-medium shadow-sm'
                                                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                                } justify-center`}
                                            title={collapsed ? item.label : undefined}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                            {!collapsed && <span className="text-sm">{item.label}</span>}

                                            {/* 收合時的 Tooltip */}
                                            {collapsed && (
                                                <div className="invisible group-hover:visible absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded whitespace-nowrap z-[100] shadow-md border border-border">
                                                    {item.label}
                                                </div>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Usage Widget */}
                {usageData && !collapsed && (
                    <div className="px-4 py-4 mt-auto border-t border-sidebar-border">
                        <div className="bg-sidebar-accent/50 rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-sidebar-primary">{usageData.planName}</span>
                                <span className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">使用中</span>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>儲存空間</span>
                                    <span>{(usageData.storageUsageMb).toFixed(1)} / {usageData.storageLimitMb} MB</span>
                                </div>
                                <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/50">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${Math.min((usageData.storageUsageMb / (usageData.storageLimitMb || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                                {usageData.nextBillingAt && (
                                    <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                                        <span>到期日</span>
                                        <span>{new Date(usageData.nextBillingAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* 收合/展開按鈕 - 在外層容器，騎在邊線上 */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute right-0 translate-x-1/2 top-8 z-20 w-6 h-6 flex items-center justify-center bg-card border border-border rounded-full hover:bg-accent hover:text-white transition-all shadow-md group"
                title={collapsed ? '展開' : '收合'}
            >
                {collapsed ? (
                    <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-white" />
                ) : (
                    <ChevronLeft className="h-3 w-3 text-muted-foreground group-hover:text-white" />
                )}
            </button>
        </div>
    )
}
