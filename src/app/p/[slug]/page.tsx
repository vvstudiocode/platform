import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { PageContentRenderer } from '@/components/store/page-content-renderer'

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
        .select('id, name, slug, logo_url')
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
        id: item.id, // Ensure ID is passed if used for key; though mapping usually uses slug/title.
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
        <div className="min-h-screen bg-white">
            <SiteHeader
                storeName={hqStore.name}
                logoUrl={hqStore.logo_url}
                navItems={navMenuItems}
                homeSlug={homepage?.slug}
            />

            {/* Page Content */}
            <main>
                <PageContentRenderer
                    content={content}
                    storeSlug={hqStore.slug}
                    tenantId={hqStore.id}
                    backgroundColor={page.background_color}
                >
                    <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
                </PageContentRenderer>
            </main>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-8">
                <div className="max-w-[1200px] mx-auto px-4 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} {hqStore.name}. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
