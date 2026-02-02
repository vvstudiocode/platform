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

    // 取得商店資訊
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug, settings, logo_url')
        .eq('slug', slug)
        .single()

    if (!store) {
        notFound()
    }

    // 檢查是否有設定首頁
    const { data: homepage } = await supabase
        .from('pages')
        .select('*')
        .eq('tenant_id', store.id)
        .eq('is_homepage', true)
        .eq('published', true)
        .single()

    // 如果有首頁，用 HomePageClient 渲染
    if (homepage) {
        // 取得導覽項目
        const { data: navItems } = await supabase
            .from('nav_items')
            .select('id, title, page_id, pages(slug)')
            .eq('tenant_id', store.id)
            .order('position', { ascending: true })

        return (
            <HomePageClient
                store={{
                    name: store.name,
                    slug: store.slug,
                    logoUrl: store.logo_url,
                    settings: store.settings as any,
                }}
                page={{
                    title: homepage.title,
                    content: (homepage.content as any[]) || [],
                }}
                navItems={(navItems || []) as any}
            />
        )
    }

    // 沒有首頁，顯示商品列表
    const { data: products } = await supabase
        .from('products')
        .select('id, name, description, price, stock, image_url, category, brand')
        .eq('tenant_id', store.id)
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

    return (
        <StorefrontClient
            store={{
                name: store.name,
                slug: store.slug,
                settings: store.settings as any,
            }}
            products={products || []}
        />
    )
}
