import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { PageContentRenderer } from '@/components/store/page-content-renderer'
import { SiteHeader } from '@/components/site-header'
import { StorePageClient } from '@/components/store/store-page-client'

interface Props {
    params: Promise<{ slug: string; pageSlug: string }>
}

// 動態生成 SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, pageSlug } = await params
    const supabase = await createClient()

    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, seo_title, seo_description')
        .eq('slug', slug)
        .single()

    if (!store) return { title: '商店不存在' }

    const { data: page } = await supabase
        .from('pages')
        .select('title, seo_title, seo_description, seo_keywords, og_image')
        .eq('tenant_id', store.id)
        .eq('slug', pageSlug)
        .eq('published', true)
        .single()

    if (!page) return { title: '頁面不存在' }

    return {
        title: page.seo_title || `${page.title} | ${store.name}`,
        description: page.seo_description || undefined,
        keywords: page.seo_keywords || undefined,
        openGraph: {
            title: page.seo_title || page.title,
            description: page.seo_description || undefined,
            images: page.og_image ? [page.og_image] : undefined,
        },
    }
}

export default async function StoreCustomPage({ params }: Props) {
    const { slug, pageSlug } = await params
    const supabase = await createClient()
    // 取得商店資訊
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug, logo_url, settings, is_hq, footer_settings')
        .eq('slug', slug)
        .single()

    if (!store) {
        notFound()
    }

    const { data: page } = await supabase
        .from('pages')
        .select('*, background_color')
        .eq('tenant_id', store.id)
        .eq('slug', pageSlug)
        .eq('published', true)
        .single()

    if (!page) {
        notFound()
    }

    // 取得導覽項目
    const { data: navItems } = await supabase
        .from('nav_items')
        .select('id, title, page_id, parent_id, position, pages(slug)')
        .eq('tenant_id', store.id)
        .order('position', { ascending: true })

    // 取得首頁 slug
    const { data: homepage } = await supabase
        .from('pages')
        .select('slug')
        .eq('tenant_id', store.id)
        .eq('is_homepage', true)
        .eq('published', true)
        .single()

    const navMenuItems = (navItems || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.pages?.slug || '',
        is_homepage: false,
        parent_id: item.parent_id,
        position: item.position
    }))

    // Transform store data to match StorePageClient props
    const settings = (store.settings as any) || {}
    const storeData = {
        id: store.id,
        name: store.name,
        slug: store.slug,
        logoUrl: store.logo_url,
        footerSettings: (store.footer_settings as any) || {}
    }

    return (
        <StorePageClient
            store={storeData}
            page={page}
            navItems={navMenuItems}
            homeSlug={homepage?.slug}
        />
    )
}
