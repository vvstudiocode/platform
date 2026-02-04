import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { PageContentRenderer } from '@/components/store/page-content-renderer'
import { SiteHeader } from '@/components/site-header'

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
        .select('id, name, slug, logo_url')
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

    const content = (page.content as any[]) || []

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            {/* Header */}
            <SiteHeader
                storeName={store.name}
                logoUrl={store.logo_url}
                navItems={navMenuItems}
                homeSlug={homepage?.slug}
                basePath={`/store/${store.slug}`}
            />


            <main>
                <PageContentRenderer
                    content={(page.content as any[]) || []}
                    storeSlug={store.slug}
                    tenantId={store.id}
                    backgroundColor={page.background_color}
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{page.title}</h1>
                </PageContentRenderer>
            </main>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-8">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} {store.name}. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
