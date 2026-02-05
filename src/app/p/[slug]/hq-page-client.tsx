'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { SiteHeader } from '@/components/site-header'
import { CartSidebar } from '@/components/store/cart-sidebar'
import { PageContentRenderer } from '@/components/store/page-content-renderer'
import { StoreFooter } from '@/components/store/store-footer'

interface NavItem {
    id: string
    title: string
    slug: string
    is_homepage: boolean
    parent_id?: string | null
    position: number
}

interface Props {
    store: {
        id: string
        name: string
        slug: string
        logoUrl?: string | null
        footerSettings?: any
    }
    page: {
        title: string
        content: any[]
        backgroundColor?: string
    }
    navItems: NavItem[]
    homeSlug?: string
}

export function HQPageClient({ store, page, navItems, homeSlug }: Props) {
    const { setStoreSlug } = useCart()
    const [isCartOpen, setIsCartOpen] = useState(false)

    useEffect(() => {
        setStoreSlug(store.slug)
    }, [store.slug, setStoreSlug])

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SiteHeader
                storeName={store.name}
                logoUrl={store.logoUrl || undefined}
                navItems={navItems}
                homeSlug={homeSlug}
                onCartClick={() => setIsCartOpen(true)}
            />

            {/* Page Content */}
            <main className="flex-1">
                <PageContentRenderer
                    content={page.content}
                    storeSlug={store.slug}
                    tenantId={store.id}
                    backgroundColor={page.backgroundColor}
                >
                    <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
                </PageContentRenderer>
            </main>

            {/* Footer */}
            <StoreFooter
                storeName={store.name}
                storeSlug={store.slug}
                settings={store.footerSettings}
            />

            {/* Cart Sidebar */}
            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                storeSlug={store.slug}
            />
        </div>
    )
}
