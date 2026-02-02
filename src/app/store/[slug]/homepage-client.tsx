'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { CartSidebar } from '@/components/store/cart-sidebar'
import { PageContentRenderer } from '@/components/store/page-content-renderer'
import { ResponsiveNav } from '@/components/store/responsive-nav'
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
    const { setStoreSlug } = useCart()
    const [isCartOpen, setIsCartOpen] = useState(false)

    useEffect(() => {
        setStoreSlug(store.slug)
    }, [store.slug, setStoreSlug])

    // 準備導覽項目
    const navigation = navItems.map(item => ({
        name: item.title,
        href: `/store/${store.slug}/${item.pages?.slug || ''}`
    }))

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* 響應式導覽列 */}
            <ResponsiveNav
                storeName={store.name}
                storeSlug={store.slug}
                navigation={navigation}
                logo={store.logoUrl || undefined}
            />

            {/* 頁面內容 */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <PageContentRenderer content={page.content} />
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
