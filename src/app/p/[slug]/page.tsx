import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

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
        .select('id, name')
        .eq('slug', 'hq')
        .single()

    if (!hqStore) {
        notFound()
    }

    // 取得頁面內容
    const { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('tenant_id', hqStore.id)
        .eq('slug', slug)
        .eq('published', true)
        .single()

    if (!page) {
        notFound()
    }

    // 渲染頁面內容（根據 content JSON 結構）
    const content = (page.content as any[]) || []

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b bg-white sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <a href="/" className="text-xl font-bold">{hqStore.name}</a>
                    <nav className="flex gap-6">
                        <a href="/" className="text-gray-600 hover:text-black">首頁</a>
                        <a href="/p/about" className="text-gray-600 hover:text-black">關於我們</a>
                    </nav>
                </div>
            </header>

            {/* Page Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">{page.title}</h1>

                {content.map((block: any, index: number) => (
                    <div key={index} className="mb-6">
                        {block.type === 'text' && (
                            <p className="text-gray-700 leading-relaxed">{block.content}</p>
                        )}
                        {block.type === 'heading' && (
                            <h2 className="text-2xl font-semibold mt-8 mb-4">{block.content}</h2>
                        )}
                        {block.type === 'image' && (
                            <img src={block.url} alt={block.alt || ''} className="w-full rounded-lg" />
                        )}
                    </div>
                ))}
            </main>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} {hqStore.name}. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
