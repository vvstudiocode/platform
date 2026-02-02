'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { ShoppingCart, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { CartSidebar } from '@/components/store/cart-sidebar'
import { PageContentRenderer } from '@/components/store/page-content-renderer'

interface Props {
    store: {
        name: string
        slug: string
        logoUrl?: string | null
        settings?: {
            primaryColor?: string
        }
    }
    page: {
        title: string
        content: any[]
    }
    navItems: Array<{
        id: string
        title: string
        page_id: string
        pages?: { slug: string } | null
    }>
}

export function HomePageClient({ store, page, navItems }: Props) {
    const { getItemCount, setStoreSlug } = useCart()
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setStoreSlug(store.slug)
    }, [store.slug, setStoreSlug])

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href={`/store/${store.slug}`} className="flex items-center gap-3">
                            {store.logoUrl ? (
                                <img src={store.logoUrl} alt={store.name} className="h-8 w-auto" />
                            ) : (
                                <span className="font-bold text-xl text-gray-900">{store.name}</span>
                            )}
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/store/${store.slug}/${item.pages?.slug}`}
                                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-gray-500 hover:text-gray-900"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {mounted && getItemCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {getItemCount()}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-gray-500 hover:text-gray-900"
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t bg-white">
                        <div className="px-4 py-3 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/store/${store.slug}/${item.pages?.slug}`}
                                    className="block py-2 text-gray-600 hover:text-gray-900"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Page Content - 使用統一的渲染元件 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <PageContentRenderer content={page.content} />
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} {store.name}. All rights reserved.
                    </p>
                </div>
            </footer>

            {/* Cart Sidebar */}
            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                storeSlug={store.slug}
            />
        </div>
    )
}
