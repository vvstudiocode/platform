'use client'

import { useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { SiteHeader } from '@/components/site-header'
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

export function StorePageClient({ store, page, navItems, homeSlug }: Props) {
    const { setStoreSlug, isCartOpen, setIsCartOpen } = useCart()

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
                basePath={`/store/${store.slug}`}
                onCartClick={() => setIsCartOpen(true)}
            />

            {/* Page Content */}
            <main className="flex-1">
                <PageContentRenderer
                    content={page.content}
                    storeSlug={store.slug}
                    tenantId={store.id}
                    backgroundColor={page.backgroundColor}
                />
            </main>

            {/* Footer */}
            <StoreFooter
                storeName={store.name}
                storeSlug={store.slug}
                settings={store.footerSettings}
            />
        </div>
    )
}
