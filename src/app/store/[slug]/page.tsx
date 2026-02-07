import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StorefrontClient } from './storefront-client'
import { HomePageClient } from './homepage-client'

interface Props {
    params: Promise<{ slug: string }>
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
