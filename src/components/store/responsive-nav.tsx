'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart } from 'lucide-react'

interface NavItem {
    name: string
    href: string
}

interface Props {
    storeName: string
    storeSlug: string
    navigation: NavItem[]
    logo?: string
}

export function ResponsiveNav({ storeName, storeSlug, navigation, logo }: Props) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [isHovered, setIsHovered] = useState(false)
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
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`font-medium transition-colors ${isTransparent
                                    ? 'text-white hover:text-white/80 drop-shadow-md'
                                    : 'text-gray-700 hover:text-gray-900'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
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
                <div className="md:hidden border-t bg-white">
                    <div className="px-4 py-3 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
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
    )
}
