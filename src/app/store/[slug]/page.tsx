import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StorefrontClient } from './storefront-client'
import { HomePageClient } from './homepage-client'

import { Metadata } from 'next'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()

    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, seo_title, seo_description, logo_url')
        .eq('slug', slug)
        .single()

    if (!store) return { title: '商店不存在' }

    // Check for homepage
    const { data: homepages } = await supabase
        .from('pages')
        .select('title, seo_title, seo_description, seo_keywords, og_image')
        .eq('tenant_id', store.id)
        .eq('is_homepage', true)
        .eq('published', true)
        .limit(1)

    const homepage = homepages && homepages.length > 0 ? homepages[0] : null

    if (homepage) {
        return {
            title: homepage.seo_title || `${homepage.title} | ${store.name}`,
            description: homepage.seo_description || store.seo_description || undefined,
            keywords: homepage.seo_keywords || undefined,
            openGraph: {
                title: homepage.seo_title || homepage.title,
                description: homepage.seo_description || store.seo_description || undefined,
                images: homepage.og_image ? [homepage.og_image] : (store.logo_url ? [store.logo_url] : undefined),
            },
        }
    }

    return {
        title: store.seo_title || store.name,
        description: store.seo_description || undefined,
        openGraph: {
            title: store.seo_title || store.name,
            description: store.seo_description || undefined,
            images: store.logo_url ? [store.logo_url] : undefined,
        },
    }
}

export default async function StorefrontPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    // 取得商店資訊（包含頁尾設定）
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug, settings, logo_url, is_hq, footer_settings')
        .eq('slug', slug)
        .single()

    if (!store) {
        notFound()
    }

    // 取得導覽項目 (Fetch Nav Items unconditionally)
    const { data: navItemsRaw } = await supabase
        .from('nav_items')
        .select('id, title, page_id, parent_id, position, pages(slug)')
        .eq('tenant_id', store.id)
        .order('position', { ascending: true })

    const navItems = navItemsRaw || []

    // 檢查是否有設定首頁 (Use limit(1) for safety)
    const { data: homepages } = await supabase
        .from('pages')
        .select('*')
        .eq('tenant_id', store.id)
        .eq('is_homepage', true)
        .eq('published', true)
        .limit(1)

    const homepage = homepages && homepages.length > 0 ? homepages[0] : null

    const settings = (store.settings as any) || {}
    // Use the stored footer_settings directly, or fallback to structure if needed
    // The admin action saves to footer_settings column with the correct structure.
    const footerSettings = (store.footer_settings as any) || {}

    // 如果有首頁，用 HomePageClient 渲染
    if (homepage) {
        return (
            <HomePageClient
                store={{
                    id: store.id,
                    name: store.name,
                    slug: store.slug,
                    logoUrl: store.logo_url,
                    settings: settings,
                    footerSettings: footerSettings,
                }}
                page={{
                    title: homepage.title,
                    content: (homepage.content as any[]) || [],
                }}
                navItems={navItems as any}
                homeSlug={homepage.slug}
            />
        )
    }

    // 沒有首頁，顯示商品列表 (Fallback)
    const { data: products } = await supabase
        .from('products')
        .select('id, name, description, price, stock, image_url, category, brand')
        .eq('tenant_id', store.id)
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

    // Transform navItems for StorefrontClient
    const clientNavItems = navItems.map((item: any) => ({
        title: item.title,
        slug: item.pages?.slug || '',
        is_homepage: false,
        parent_id: item.parent_id,
        position: item.position
    }))

    return (
        <StorefrontClient
            store={{
                name: store.name,
                slug: store.slug,
                settings: settings,
                footerSettings: footerSettings,
            }}
            products={products?.map(p => ({
                ...p,
                stock: p.stock || 0
            })) || []}
            navItems={clientNavItems}
        />
    )
}
