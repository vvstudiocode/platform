'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface NavItem {
    title: string
    slug: string
    is_homepage: boolean
    parent_id?: string | null
    position: number
}

interface SiteHeaderProps {
    storeName: string
    logoUrl?: string
    navItems: NavItem[]
    homeSlug?: string  // 設定的首頁 slug
    basePath?: string  // 基本路徑前綴，例如 '' 或 '/store/nike'
}

export function SiteHeader({ storeName, logoUrl, navItems, homeSlug, basePath = '' }: SiteHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // 首頁連結：如果有設定首頁則連到該頁面，否則連到基本路徑
    // 如果是商店頁面 (basePath 包含 /store)，路徑不需要加 /p/ (因為路徑是 /store/[slug]/[pageSlug])
    // 如果是總部頁面 (basePath 為空)，路徑需要加 /p/ (因為路徑是 /p/[slug])
    const isStorePath = basePath.includes('/store')
    const pagePrefix = isStorePath ? '' : '/p'

    const homePath = homeSlug ? `${basePath}${pagePrefix}/${homeSlug}` : (basePath || '/')

    // Build recursive tree for navigation
    const navTree = navItems.reduce<any[]>((acc, item: any) => {
        if (!item.parent_id) {
            acc.push({ ...item, children: [] })
        }
        return acc
    }, [])

    // Populate children
    navItems.forEach((item: any) => {
        if (item.parent_id) {
            const parent = navTree.find((p: any) => p.id === item.parent_id)
            if (parent) {
                parent.children.push(item)
            }
        }
    })

    // Sort
    navTree.sort((a, b) => a.position - b.position)
    navTree.forEach(node => {
        node.children.sort((a: any, b: any) => a.position - b.position)
    })

    return (
        <header className="border-b bg-white sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo / Store Name */}
                <Link href={homePath} className="flex items-center gap-2">
                    {logoUrl && (
                        <img src={logoUrl} alt="" className="h-8 w-8 rounded object-cover" />
                    )}
                    <span className="text-xl font-bold">{storeName}</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-8">
                    {navTree.map((item) => (
                        <div key={item.slug} className="relative group">
                            <Link
                                href={`${basePath}${pagePrefix}/${item.slug}`}
                                className="text-gray-600 hover:text-black transition-colors py-2 inline-flex items-center gap-1"
                            >
                                {item.title}
                            </Link>

                            {/* Dropdown */}
                            {item.children && item.children.length > 0 && (
                                <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-100 shadow-lg rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                                    <div className="py-1">
                                        {item.children.map((child: any) => (
                                            <Link
                                                key={child.slug}
                                                href={`${basePath}${pagePrefix}/${child.slug}`}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 bg-white"
                                            >
                                                {child.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-600 hover:text-black"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-white">
                    <nav className="flex flex-col px-4 py-2">
                        {navTree.map((item) => (
                            <div key={item.slug}>
                                <Link
                                    href={`${basePath}${pagePrefix}/${item.slug}`}
                                    className="block py-3 text-gray-600 hover:text-black border-b border-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.title}
                                </Link>
                                {item.children && item.children.length > 0 && (
                                    <div className="pl-4 bg-gray-50/50">
                                        {item.children.map((child: any) => (
                                            <Link
                                                key={child.slug}
                                                href={`${basePath}${pagePrefix}/${child.slug}`}
                                                className="block py-3 text-sm text-gray-500 hover:text-black border-b border-gray-100 last:border-0"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {child.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    )
}
