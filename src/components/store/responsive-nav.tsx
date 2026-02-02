'use client'

import { useState } from 'react'
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

    return (
        <nav className="bg-white border-b sticky top-0 z-50">
            {/* Desktop & Mobile Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href={`/store/${storeSlug}`} className="flex items-center gap-3">
                        {logo && (
                            <img
                                src={logo}
                                alt={storeName}
                                className="h-10 w-auto object-contain"
                            />
                        )}
                        <span className="text-xl font-bold text-gray-900">{storeName}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href={`/store/${storeSlug}/checkout`}
                            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
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
