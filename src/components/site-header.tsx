'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface NavItem {
    title: string
    slug: string
    is_homepage: boolean
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
    const homePath = homeSlug ? `${basePath}/p/${homeSlug}` : (basePath || '/')

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
                <nav className="hidden md:flex gap-6">
                    <Link href={homePath} className="text-gray-600 hover:text-black transition-colors">
                        首頁
                    </Link>
                    {navItems.map((item) => (
                        <Link
                            key={item.slug}
                            href={`${basePath}/p/${item.slug}`}
                            className="text-gray-600 hover:text-black transition-colors"
                        >
                            {item.title}
                        </Link>
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
                        <Link
                            href={homePath}
                            className="py-3 text-gray-600 hover:text-black border-b border-gray-100"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            首頁
                        </Link>
                        {navItems.map((item) => (
                            <Link
                                key={item.slug}
                                href={`${basePath}/p/${item.slug}`}
                                className="py-3 text-gray-600 hover:text-black border-b border-gray-100"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    )
}
