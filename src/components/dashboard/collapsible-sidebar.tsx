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
    const pathname = usePathname()

    return (
        <aside className="w-64 border-r border-zinc-800 bg-zinc-900 px-4 py-6 overflow-y-auto h-full hidden md:flex md:flex-col">
            <nav className="space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
                    const Icon = iconMap[item.icon] || LayoutDashboard

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${isActive
                                ? 'bg-rose-500/10 text-rose-500'
                                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                                }`}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
