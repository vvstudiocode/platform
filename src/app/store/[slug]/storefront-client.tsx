'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { ShoppingCart, Search, Menu } from 'lucide-react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { ResponsiveNav } from '@/components/store/responsive-nav'
import { StoreFooter } from '@/components/store/store-footer'
import { ProductCard } from '@/components/store/product-blocks'

interface Props {
    store: {
        id: string
        name: string
        slug: string
        settings?: {
            logoUrl?: string
            primaryColor?: string
        }
        footerSettings?: any
        planId?: string
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
                storeId={store.id}
                planId={store.planId}
            />

            {/* Products */}
            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">所有商品</h2>

                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                storeSlug={store.slug}
                            />
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
