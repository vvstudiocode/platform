'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, ClipboardList } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { CartPopover } from '@/components/store/cart-popover'
import { OrderLookupPopover } from '@/components/store/order-lookup-popover'

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
    onCartClick?: () => void  // 購物車按鈕點擊回調
}

export function SiteHeader({ storeName, logoUrl, navItems, homeSlug, basePath = '', onCartClick }: SiteHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [showOrderLookup, setShowOrderLookup] = useState(false)
    const { getItemCount, storeSlug } = useCart()

    useEffect(() => {
        setMounted(true)
    }, [])

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
        <>
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
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
                                    className="text-muted-foreground hover:text-foreground transition-colors py-2 inline-flex items-center gap-1 font-medium"
                                >
                                    {item.title}
                                </Link>

                                {/* Dropdown */}
                                {item.children && item.children.length > 0 && (
                                    <div className="absolute top-full left-0 mt-0 w-48 bg-popover border border-border shadow-soft rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                                        <div className="py-1">
                                            {item.children.map((child: any) => (
                                                <Link
                                                    key={child.slug}
                                                    href={`${basePath}${pagePrefix}/${child.slug}`}
                                                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 bg-popover"
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

                    {/* Right side actions */}
                    <div className="flex items-center gap-2 relative">
                        {/* Order Lookup Button */}
                        <button
                            onClick={() => setShowOrderLookup(true)}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                            title="訂單查詢"
                        >
                            <ClipboardList className="h-6 w-6" />
                        </button>

                        {/* Cart Button with Popover */}
                        {onCartClick && mounted && (
                            <>
                                <button
                                    onClick={onCartClick}
                                    className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="購物車"
                                >
                                    <ShoppingCart className="h-6 w-6" />
                                    {getItemCount() > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                            {getItemCount()}
                                        </span>
                                    )}
                                </button>
                                <CartPopover />
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div
                    className={`md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-md shadow-xl border-t border-border z-50 h-[calc(100vh-80px)] overflow-y-auto transition-all duration-300 ease-in-out origin-top ${isMenuOpen
                        ? 'opacity-100 translate-y-0 visible pointer-events-auto'
                        : 'opacity-0 -translate-y-4 invisible pointer-events-none'
                        }`}
                >
                    <nav className="flex flex-col px-6 py-4 space-y-1">
                        {navTree.map((item) => (
                            <div key={item.slug} className="group">
                                <Link
                                    href={`${basePath}${pagePrefix}/${item.slug}`}
                                    className="block py-4 text-lg font-medium text-foreground hover:text-accent border-b border-border group-last:border-0 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.title}
                                </Link>
                                {item.children && item.children.length > 0 && (
                                    <div className="pl-4 space-y-1 bg-muted/30 rounded-lg mb-2">
                                        {item.children.map((child: any) => (
                                            <Link
                                                key={child.slug}
                                                href={`${basePath}${pagePrefix}/${child.slug}`}
                                                className="block py-3 text-base text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2 rounded-md transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {child.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Order Lookup (Mobile) */}
                        <button
                            onClick={() => {
                                setIsMenuOpen(false)
                                setShowOrderLookup(true)
                            }}
                            className="w-full flex items-center gap-2 py-4 text-lg font-medium text-foreground hover:text-accent border-b border-border transition-colors text-left"
                        >
                            <ClipboardList className="h-6 w-6" />
                            訂單查詢
                        </button>
                    </nav>
                </div>
            </header>

            <OrderLookupPopover
                isOpen={showOrderLookup}
                onClose={() => setShowOrderLookup(false)}
                storeSlug={storeSlug || ''}
            />
        </>
    )
}
