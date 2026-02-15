'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
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
        background_color?: string
    }
    navItems: Array<{
        id: string
        title: string
        page_id: string
        slug?: string
        parent_id?: string | null
        position: number
        pages?: { slug: string; is_homepage: boolean } | null
    }>
    homeSlug?: string
}


export function HomePageClient({ store, page, navItems, homeSlug }: Props) {
    const { setStoreSlug, isCartOpen, setIsCartOpen } = useCart()

    useEffect(() => {
        setStoreSlug(store.slug)
    }, [store.slug, setStoreSlug])

    // 準備導覽項目
    const navMenuItems = navItems.map(item => ({
        id: item.id,
        title: item.title,
        slug: item.pages?.slug || '',
        is_homepage: item.pages?.is_homepage || false,
        parent_id: item.parent_id,
        position: item.position
    }))

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: page.background_color || '#ffffff' }}
        >
            {/* 響應式導覽列 */}
            <SiteHeader
                storeName={store.name}
                logoUrl={store.logoUrl || undefined}
                navItems={navMenuItems}
                homeSlug={homeSlug}
                basePath={store.slug === 'omo' ? '' : `/store/${store.slug}`}
                onCartClick={() => setIsCartOpen(true)}
                storeId={store.id}
            />

            {/* 頁面內容 */}
            <main className="flex-1">
                <PageContentRenderer
                    content={page.content}
                    storeSlug={store.slug}
                    tenantId={store.id}
                    backgroundColor={page.background_color}
                />
            </main>

            {/* 商店頁尾 */}
            <StoreFooter
                storeName={store.name}
                storeSlug={store.slug}
                settings={store.footerSettings}
            />


        </div>
    )
}
