import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { HQPageClient } from './hq-page-client'

interface Props {
    params: Promise<{ slug: string }>
}

// 動態生成 SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()

    // 取得總部商店 (slug = 'hq' 或第一個商店)
    const { data: hqStore } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'hq')
        .single()

    if (!hqStore) return { title: '頁面不存在' }

    const { data: page } = await supabase
        .from('pages')
        .select('title, seo_title, seo_description, seo_keywords, og_image')
        .eq('tenant_id', hqStore.id)
        .eq('slug', slug)
        .eq('published', true)
        .single()

    if (!page) return { title: '頁面不存在' }

    return {
        title: page.seo_title || page.title,
        description: page.seo_description || undefined,
        keywords: page.seo_keywords || undefined,
        openGraph: {
            title: page.seo_title || page.title,
            description: page.seo_description || undefined,
            images: page.og_image ? [page.og_image] : undefined,
        },
    }
}

export default async function HQPageRoute({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    // 取得總部商店
    const { data: hqStore } = await supabase
        .from('tenants')
        .select('id, name, slug, logo_url, footer_settings')
        .eq('slug', 'hq')
        .single()

    if (!hqStore) {
        notFound()
    }

    // 取得頁面內容
    const { data: page } = await supabase
        .from('pages')
        .select('*, background_color')
        .eq('tenant_id', hqStore.id)
        .eq('slug', slug)
        .eq('published', true)
        .single()

    if (!page) {
        notFound()
    }

    // 從 nav_items 取得導覽選單項目
    const { data: navItems } = await supabase
        .from('nav_items')
        .select('id, title, page_id, parent_id, position, pages(slug)')
        .eq('tenant_id', hqStore.id)
        .order('position', { ascending: true })

    // 轉換成 SiteHeader 需要的格式
    const navMenuItems = (navItems || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.pages?.slug || '',
        is_homepage: false,
        parent_id: item.parent_id,
        position: item.position
    }))

    // 取得設定的首頁
    const { data: homepage } = await supabase
        .from('pages')
        .select('slug')
        .eq('tenant_id', hqStore.id)
        .eq('is_homepage', true)
        .eq('published', true)
        .single()

    // 渲染頁面內容
    const content = (page.content as any[]) || []

    return (
        <HQPageClient
            store={{
                id: hqStore.id,
                name: hqStore.name,
                slug: hqStore.slug,
                logoUrl: hqStore.logo_url,
                footerSettings: hqStore.footer_settings,
            }}
            page={{
                title: page.title,
                content: content,
                backgroundColor: page.background_color,
            }}
            navItems={navMenuItems}
            homeSlug={homepage?.slug}
        />
    )
}

