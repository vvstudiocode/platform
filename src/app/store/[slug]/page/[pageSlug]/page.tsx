import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { PageContentRenderer } from '@/components/store/page-content-renderer'

interface Props {
    params: Promise<{ slug: string; pageSlug: string }>
}

// 動態生成 SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, pageSlug } = await params
    const supabase = await createClient()

    // 取得商店
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, seo_title, seo_description')
        .eq('slug', slug)
        .single()

    if (!store) return { title: '商店不存在' }

    // 取得頁面
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

    // 取得商店
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug, logo_url, settings')
        .eq('slug', slug)
        .single()

    if (!store) {
        notFound()
    }

    // 取得頁面
    const { data: page } = await supabase
        .from('pages')
        .select('*')
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
        .select('id, title, page_id, pages(slug)')
        .eq('tenant_id', store.id)
        .order('position', { ascending: true })

    const content = (page.content as any[]) || []

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href={`/store/${store.slug}`} className="flex items-center gap-2">
                        {store.logo_url && (
                            <img src={store.logo_url} alt="" className="h-8 w-8 rounded" />
                        )}
                        <span className="text-xl font-bold">{store.name}</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href={`/store/${store.slug}`} className="text-gray-600 hover:text-black">
                            首頁
                        </Link>
                        {(navItems || []).map((item: any) => (
                            <Link
                                key={item.id}
                                href={`/store/${store.slug}/${item.pages?.slug}`}
                                className={`text-gray-600 hover:text-black ${pageSlug === item.pages?.slug ? 'font-medium text-black' : ''}`}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                    <Link href={`/store/${store.slug}/checkout`} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ShoppingCart className="h-5 w-5" />
                    </Link>
                </div>
            </header>

            {/* Page Content - 使用統一渲染元件 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <PageContentRenderer content={content} />
            </main>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} {store.name}. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
