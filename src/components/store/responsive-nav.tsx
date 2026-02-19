'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, ClipboardList, ChevronDown, User } from 'lucide-react'
import { OrderLookupModal } from './order-lookup-modal'
import { CustomerAuthModal } from './customer-auth-modal'

interface NavItem {
    name: string
    href: string
    children?: NavItem[]
}

interface Props {
    storeName: string
    storeSlug: string
    storeId: string
    navigation: NavItem[]
    logo?: string
    planId?: string
}

export function ResponsiveNav({ storeName, storeSlug, storeId, navigation, logo, planId }: Props) {
    const isAdvanced = planId === 'growth'
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [isHovered, setIsHovered] = useState(false)
    const [showOrderLookup, setShowOrderLookup] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const lastScrollY = useRef(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            // Check if top (transparent background logic)
            setIsScrolled(currentScrollY > 20)

            // Scroll direction logic for visibility
            if (currentScrollY > 60) { // Only hide after passing header/hero area
                if (currentScrollY > lastScrollY.current) {
                    // Scrolling down
                    setIsVisible(false)
                } else {
                    // Scrolling up
                    setIsVisible(true)
                }
            } else {
                // At top
                setIsVisible(true)
            }

            lastScrollY.current = currentScrollY
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const isTransparent = !isScrolled && !isHovered && !mobileMenuOpen
    // Show if: Visible (scroll up/top) OR Hovered OR Mobile Menu Open
    const shouldShow = isVisible || isHovered || mobileMenuOpen

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform 
                    ${shouldShow ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
                    ${isTransparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-sm border-b shadow-sm'}
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Desktop & Mobile Container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20 transition-all duration-300">
                        {/* Logo */}
                        <Link href={`/store/${storeSlug}`} className="flex items-center gap-3">
                            {logo && (
                                <img
                                    src={logo}
                                    alt={storeName}
                                    className="h-10 w-auto object-contain"
                                />
                            )}
                            <span className={`text-xl font-bold transition-colors ${isTransparent ? 'text-white drop-shadow-md' : 'text-gray-900'
                                }`}>
                                {storeName}
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            {navigation.map((item) => (
                                <div key={item.href} className="relative group">
                                    {item.children && item.children.length > 0 ? (
                                        <>
                                            <button className={`flex items-center gap-1 font-medium transition-colors ${isTransparent
                                                ? 'text-white hover:text-white/80 drop-shadow-md'
                                                : 'text-gray-700 hover:text-gray-900'
                                                }`}>
                                                {item.name}
                                                <ChevronDown className="h-4 w-4" />
                                            </button>

                                            {/* Level 1 Dropdown */}
                                            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px]">
                                                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden py-1">
                                                    {item.children.map(child => (
                                                        <div key={child.href} className="relative group/sub">
                                                            {child.children && child.children.length > 0 ? (
                                                                <>
                                                                    <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between cursor-pointer text-gray-700">
                                                                        <span>{child.name}</span>
                                                                        <ChevronDown className="h-3 w-3 -rotate-90 text-gray-400" />
                                                                    </div>
                                                                    {/* Level 2 Dropdown (Right side) */}
                                                                    <div className="absolute left-full top-0 ml-0.5 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 min-w-[200px]">
                                                                        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden py-1">
                                                                            {child.children.map(grandchild => (
                                                                                <Link
                                                                                    key={grandchild.href}
                                                                                    href={grandchild.href}
                                                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                                >
                                                                                    {grandchild.name}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <Link
                                                                    href={child.href}
                                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className={`font-medium transition-colors ${isTransparent
                                                ? 'text-white hover:text-white/80 drop-shadow-md'
                                                : 'text-gray-700 hover:text-gray-900'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            ))}

                            {/* Auth Button */}
                            {isAdvanced && (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className={`flex items-center gap-1 font-medium transition-colors ${isTransparent
                                        ? 'text-white hover:text-white/80 drop-shadow-md'
                                        : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                >
                                    <User className="h-5 w-5" />
                                </button>
                            )}

                            {/* Order Lookup Button */}
                            <button
                                onClick={() => setShowOrderLookup(true)}
                                className={`flex items-center gap-1 font-medium transition-colors ${isTransparent
                                    ? 'text-white hover:text-white/80 drop-shadow-md'
                                    : 'text-gray-700 hover:text-gray-900'
                                    }`}
                            >
                                <ClipboardList className="h-5 w-5" />
                                {/* <span className="text-sm">訂單查詢</span> */}
                            </button>

                            <Link
                                href={`/store/${storeSlug}/checkout`}
                                className={`p-2 rounded-lg transition-colors ${isTransparent
                                    ? 'text-white hover:bg-white/20'
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <ShoppingCart className="h-5 w-5" />
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`md:hidden p-2 rounded-lg transition-colors ${isTransparent
                                ? 'text-white hover:bg-white/20'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t bg-white max-h-[80vh] overflow-y-auto">
                        <div className="px-4 py-3 space-y-1">
                            {navigation.map((item) => (
                                <div key={item.href}>
                                    {item.children && item.children.length > 0 ? (
                                        <div className="space-y-1">
                                            <div className="px-3 py-2 text-gray-900 font-bold bg-gray-50 rounded-lg">
                                                {item.name}
                                            </div>
                                            <div className="pl-4 space-y-1 border-l-2 border-gray-100 ml-3">
                                                {item.children.map(child => (
                                                    <div key={child.href}>
                                                        {child.children && child.children.length > 0 ? (
                                                            <div className="space-y-1">
                                                                <div className="px-3 py-2 text-gray-800 font-medium">
                                                                    {child.name}
                                                                </div>
                                                                <div className="pl-4 space-y-1 border-l-2 border-gray-100 ml-3">
                                                                    {child.children.map(grandchild => (
                                                                        <Link
                                                                            key={grandchild.href}
                                                                            href={grandchild.href}
                                                                            className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                                                                            onClick={() => setMobileMenuOpen(false)}
                                                                        >
                                                                            {grandchild.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Link
                                                                href={child.href}
                                                                className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                {child.name}
                                                            </Link>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            ))}
                            <div className="h-px bg-gray-100 my-2"></div>
                            {isAdvanced && (
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false)
                                        setShowAuthModal(true)
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-left"
                                >
                                    <User className="h-5 w-5" />
                                    會員登入/註冊
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false)
                                    setShowOrderLookup(true)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-left"
                            >
                                <ClipboardList className="h-5 w-5" />
                                訂單查詢
                            </button>
                            <Link
                                href={`/store/${storeSlug}/checkout`}
                                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                購物車
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            <OrderLookupModal
                isOpen={showOrderLookup}
                onClose={() => setShowOrderLookup(false)}
                storeSlug={storeSlug}
            />

            {showAuthModal && (
                <CustomerAuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    storeId={storeId}
                    storeName={storeName}
                />
            )}
        </>
    )
}
