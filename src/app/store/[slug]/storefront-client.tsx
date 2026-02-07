'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { ShoppingCart, Search, Menu } from 'lucide-react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { ResponsiveNav } from '@/components/store/responsive-nav'
import { StoreFooter } from '@/components/store/store-footer'

interface Props {
    store: {
        name: string
        slug: string
        settings?: {
            logoUrl?: string
            primaryColor?: string
        }
        footerSettings?: any
    }
    products: Array<{
        id: string
        name: string
        description: string | null
        price: number
        stock: number
        image_url: string | null
        category: string | null
        brand: string | null
    }>
    navItems?: Array<{
        title: string
        slug: string
        is_homepage: boolean
        parent_id?: string | null
        position: number
    }>
}

export function StorefrontClient({ store, products, navItems = [] }: Props) {
    const { getItemCount, setStoreSlug, isCartOpen, setIsCartOpen } = useCart()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setStoreSlug(store.slug)
    }, [store.slug, setStoreSlug])

    const settings = store.settings || {}

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <SiteHeader
                storeName={store.name}
                logoUrl={settings.logoUrl || undefined}
                navItems={navItems}
                homeSlug={undefined}
                basePath={store.slug === 'omo' ? '' : `/store/${store.slug}`}
                onCartClick={() => setIsCartOpen(true)}
            />

            {/* Products */}
            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">所有商品</h2>

                {products && products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={store.slug === 'omo' ? `/product/${product.id}` : `/store/${store.slug}/product/${product.id}`}
                                className="group"
                            >
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            無圖片
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-medium text-gray-900 group-hover:text-rose-500 transition-colors">
                                    {product.name}
                                </h3>
                                {product.brand && (
                                    <p className="text-sm text-gray-500">{product.brand}</p>
                                )}
                                <p className="mt-1 font-bold text-gray-900">
                                    NT$ {Number(product.price).toLocaleString()}
                                </p>
                                {product.stock <= 5 && product.stock > 0 && (
                                    <p className="text-xs text-amber-600 mt-1">僅剩 {product.stock} 件</p>
                                )}
                                {product.stock === 0 && (
                                    <p className="text-xs text-red-500 mt-1">已售完</p>
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500">目前沒有上架商品</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-100 py-8">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} {store.name}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}
