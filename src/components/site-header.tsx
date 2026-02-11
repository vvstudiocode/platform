'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, ClipboardList, ChevronDown } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { CartPopover } from '@/components/store/cart-popover'
import { OrderLookupPopover } from '@/components/store/order-lookup-popover'

interface NavItem {
    id?: string
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

    const isStorePath = basePath.includes('/store')
    const pagePrefix = (isStorePath || basePath === '') ? '' : '/p'

    const getNavItemPath = (item: NavItem) => {
        if (item.is_homepage) {
            return basePath || '/'
        }
        return `${basePath}${pagePrefix}/${item.slug}`
    }

    const homePath = basePath || '/'

    // Recursive Tree Builder
    const buildNavTree = (items: NavItem[]): any[] => {
        const itemMap = new Map<string, any>()
        const roots: any[] = []

        items.forEach(item => {
            // @ts-ignore
            itemMap.set(item.id || item.slug, { ...item, children: [] })
        })

        items.forEach(item => {
            // @ts-ignore
            const node = itemMap.get(item.id || item.slug)
            if (item.parent_id && itemMap.has(item.parent_id)) {
                const parent = itemMap.get(item.parent_id)
                parent.children.push(node)
            } else {
                roots.push(node)
            }
        })

        const sortNodes = (nodes: any[]) => {
            nodes.sort((a, b) => a.position - b.position)
            nodes.forEach(node => {
                if (node.children) sortNodes(node.children)
            })
        }
        sortNodes(roots)
        return roots
    }

    const navTree = buildNavTree(navItems)

    // Inner Recursive Nav Item (Desktop) - supports 3+ levels
    const DesktopNavItem = ({ item, level = 0 }: { item: any, level?: number }) => {
        const [isOpen, setIsOpen] = useState(false)
        const hasChildren = item.children && item.children.length > 0
        const isLevel0 = level === 0

        if (hasChildren) {
            return (
                <div
                    className="relative flex items-center h-full"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {/* Parent item: Link + Toggle */}
                    <div className={`flex items-center h-full ${isLevel0 ? '' : 'w-full justify-between hover:bg-muted/50 rounded-sm'}`}>
                        <Link
                            href={getNavItemPath(item)}
                            className={`font-medium transition-colors flex items-center
                                ${isLevel0
                                    ? 'text-muted-foreground hover:text-foreground h-full px-1'
                                    : 'px-4 py-2 text-sm text-muted-foreground hover:text-foreground flex-1'
                                }
                            `}
                        >
                            {item.title}
                        </Link>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen) }}
                            className={`p-1 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center
                                ${isLevel0 ? 'h-full flex' : 'pr-2'}
                            `}
                            aria-label="展開子選單"
                        >
                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${!isLevel0 ? '-rotate-90' : ''}`} />
                        </button>
                    </div>

                    {/* Dropdown Menu - Increased safe area with padding instead of margin */}
                    {isOpen && (
                        <div className={`
                            absolute z-[999] bg-transparent
                            ${isLevel0 ? 'top-full pt-0 left-0' : 'left-[95%] -top-1 pl-4'}
                        `}>
                            <div className="bg-popover border border-border shadow-lg rounded-md overflow-visible min-w-[200px] py-1">
                                {item.children.map((child: any) => (
                                    <DesktopNavItem key={child.slug || child.id} item={child} level={level + 1} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )
        }

        // Leaf node: just a link
        return (
            <Link
                href={getNavItemPath(item)}
                className={`transition-colors font-medium
                    ${isLevel0 ? 'flex items-center h-full text-muted-foreground hover:text-foreground px-1' : 'block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50'}
                `}
            >
                {item.title}
            </Link>
        )
    }

    // Mobile Nav Item - supports 3+ levels with accordion
    const MobileNavItem = ({ item, depth = 0 }: { item: any, depth?: number }) => {
        const [isOpen, setIsOpen] = useState(false)
        const hasChildren = item.children && item.children.length > 0

        if (hasChildren) {
            return (
                <div className={depth === 0 ? "border-b border-border/50 last:border-0" : ""}>
                    {/* Parent: Link + Toggle */}
                    <div className="flex items-center justify-between">
                        <Link
                            href={getNavItemPath(item)}
                            className={`flex-1 py-3 font-medium transition-colors
                                ${depth === 0 ? 'text-lg text-foreground' : 'text-base text-muted-foreground hover:text-foreground'}
                            `}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.title}
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-muted-foreground hover:text-foreground"
                            aria-label="展開子選單"
                        >
                            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    {isOpen && (
                        <div className="pl-4 pb-2 space-y-1 border-l-2 border-border/50 ml-2">
                            {item.children.map((child: any) => (
                                <MobileNavItem key={child.slug || child.id} item={child} depth={depth + 1} />
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        // Leaf node
        return (
            <Link
                href={getNavItemPath(item)}
                className={`block py-2 transition-colors rounded-md
                    ${depth === 0 ? 'text-lg font-medium text-foreground py-4 border-b border-border/50' : 'text-base text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2'}
                `}
                onClick={() => setIsMenuOpen(false)}
            >
                {item.title}
            </Link>
        )
    }


    return (
        <>
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                    {/* Logo / Store Name */}
                    <Link href={homePath} className="flex items-center gap-2">
                        {logoUrl && (
                            <img src={logoUrl} alt="" className="h-8 w-8 rounded object-cover" />
                        )}
                        <span className="text-xl font-bold">{storeName}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-8 h-full">
                        {navTree.map((item) => (
                            <DesktopNavItem key={item.slug} item={item} />
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
                            <MobileNavItem key={item.slug} item={item} />
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
