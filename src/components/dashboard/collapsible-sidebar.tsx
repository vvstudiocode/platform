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
    Menu,
    LucideIcon
} from 'lucide-react'

// 圖示映射表
const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FileText,
    Settings,
    Menu,
}

interface NavItem {
    href: string
    icon: string  // 改為字串
    label: string
}

interface Props {
    navItems: NavItem[]
}

export function CollapsibleSidebar({ navItems }: Props) {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()

    return (
        <aside className={`${collapsed ? 'w-16' : 'w-56'} border-r border-zinc-800 bg-zinc-900 p-4 overflow-y-auto transition-all duration-300 relative`}>
            {/* 收合按鈕 */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-4 z-10 p-1.5 bg-zinc-800 border border-zinc-700 rounded-full hover:bg-zinc-700 transition-colors"
                title={collapsed ? '展開' : '收合'}
            >
                {collapsed ? (
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                ) : (
                    <ChevronLeft className="h-4 w-4 text-zinc-400" />
                )}
            </button>

            <nav className="space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
                    const Icon = iconMap[item.icon] || LayoutDashboard  // 獲取對應的圖示組件

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${isActive
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                                }`}
                            title={collapsed ? item.label : ''}
                        >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
