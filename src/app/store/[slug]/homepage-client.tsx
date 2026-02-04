'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { CartSidebar } from '@/components/store/cart-sidebar'
import { PageContentRenderer } from '@/components/store/page-content-renderer'
import { SiteHeader } from '@/components/site-header'
import { StoreFooter } from '@/components/store/store-footer'

interface Props {
    store: {
        name: string
        slug: string
        logoUrl?: string | null
        settings?: {
            primaryColor?: string
        }
        footerSettings?: any
        id: string
    }
    page: {
        title: string
        content: any[]
    }
    navItems: Array<{
        id: string
        title: string
        page_id: string
        slug?: string
        parent_id?: string | null
        position: number
        pages?: { slug: string } | null
    }>
    homeSlug?: string
}


export function HomePageClient({ store, page, navItems, homeSlug }: Props) {
    const { setStoreSlug } = useCart()
    const [isCartOpen, setIsCartOpen] = useState(false)

    useEffect(() => {
        setStoreSlug(store.slug)
    }, [store.slug, setStoreSlug])

    // 準備導覽項目
    const navMenuItems = navItems.map(item => ({
        id: item.id,
        title: item.title,
        slug: item.pages?.slug || '',
        is_homepage: false,
        parent_id: item.parent_id,
        position: item.position
    }))

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* 響應式導覽列 */}
            <SiteHeader
                storeName={store.name}
                logoUrl={store.logoUrl || undefined}
                navItems={navMenuItems}
                homeSlug={homeSlug}
                basePath={`/store/${store.slug}`}
            />

            {/* 頁面內容 */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <PageContentRenderer content={page.content} storeSlug={store.slug} tenantId={store.id} />
                </div>
            </main>

            {/* 商店頁尾 */}
            <StoreFooter
                storeName={store.name}
                storeSlug={store.slug}
                settings={store.footerSettings}
            />

            {/* 購物車側邊欄 */}
            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                storeSlug={store.slug}
            />
        </div>
    )
}
