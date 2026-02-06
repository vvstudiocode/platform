import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { PageContentRenderer } from '@/components/store/page-content-renderer'

export default async function HomePage() {
    const supabase = await createClient()

    // 取得總部商店 (slug = 'hq' 或第一個商店)
    const { data: hqStore } = await supabase
        .from('tenants')
        .select('id, name, slug, logo_url')
        .eq('slug', 'omo')
        .single()

    if (!hqStore) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-gray-500">商店準備中...</p>
            </div>
        )
    }

    // 取得設定的首頁
    const { data: homepage } = await supabase
        .from('pages')
        .select('*, background_color')
        .eq('tenant_id', hqStore.id)
        .eq('is_homepage', true)
        .eq('published', true)
        .single()

    // 如果沒有設定首頁，顯示預設畫面
    if (!homepage) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-white text-black">
                <h1 className="text-4xl font-bold">Welcome to {hqStore.name}</h1>
                <p className="mt-4 text-lg text-gray-600">Please set a homepage in the admin panel.</p>
            </div>
        )
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

    const content = (homepage.content as any[]) || []

    return (
        <div className="min-h-screen bg-white">
            <SiteHeader
                storeName={hqStore.name}
                logoUrl={hqStore.logo_url}
                navItems={navMenuItems}
                homeSlug={homepage.slug}
            />

            <main>
                <PageContentRenderer
                    content={content}
                    storeSlug={hqStore.slug}
                    tenantId={hqStore.id}
                    backgroundColor={homepage.background_color}
                />
            </main>

            <footer className="border-t bg-gray-50 py-8">
                <div className="max-w-[1200px] mx-auto px-4 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} {hqStore.name}. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
