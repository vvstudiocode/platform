'use client'

import { useState, useEffect } from 'react'
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
    LucideIcon,
    X
} from 'lucide-react'

// 圖示映射表
const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FileText,
    Settings,
    Menu: MenuIcon,
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
        <div className={`
            ${collapsed ? 'w-20' : 'w-48'} 
            hidden md:flex h-full transition-all duration-300 relative
        `}>
            {/* 側邊欄主體 */}
            <aside className="flex-1 border-r border-zinc-800 bg-zinc-900 py-6 overflow-y-auto h-full flex flex-col">
                <nav className="space-y-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
                        const Icon = iconMap[item.icon] || LayoutDashboard

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative flex items-center gap-3 rounded-lg py-2.5 transition-colors ${isActive
                                    ? 'bg-rose-500/10 text-rose-500'
                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                                    } justify-center`}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {!collapsed && <span className="font-medium text-sm">{item.label}</span>}

                                {/* 收合時的 Tooltip */}
                                {collapsed && (
                                    <div className="invisible group-hover:visible absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-sm rounded whitespace-nowrap z-50 shadow-lg">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* 收合/展開按鈕 - 在外層容器，騎在邊線上 */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 flex items-center justify-center bg-zinc-800 border border-zinc-700 rounded-full hover:bg-zinc-700 transition-colors shadow-lg"
                title={collapsed ? '展開' : '收合'}
            >
                {collapsed ? (
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                ) : (
                    <ChevronLeft className="h-4 w-4 text-zinc-400" />
                )}
            </button>
        </div>
    )
}
