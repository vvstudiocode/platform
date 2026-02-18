import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

interface Props {
    params: Promise<{ site: string; productId: string }>
}

/**
 * LINE Order Redirect Page
 * This page serves two purposes:
 * 1. Provides SEO/OG tags for LINE link preview (image, title, description)
 * 2. Automatically redirects to LINE oaMessage URL for "+1" ordering
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { site, productId } = await params
    const supabase = await createClient()

    // Fetch product and tenant info
    const { data: product } = await supabase
        .from('products')
        .select('name, description, image_url, keyword, sku, tenants(name, slug, settings)')
        .eq('id', productId)
        .single()

    if (!product) return { title: '商品不存在' }

    const tenantSettings = (product.tenants as any)?.settings || {}
    const storeName = product.tenants?.name || '我們的商店'
    const description = product.description || `在 ${storeName} 購買 ${product.name}`

    return {
        title: `${product.name} | ${storeName}`,
        description: description,
        openGraph: {
            title: product.name,
            description: description,
            images: product.image_url ? [product.image_url] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: description,
            images: product.image_url ? [product.image_url] : [],
        },
    }
}

export default async function LineOrderPage({ params }: Props) {
    const { site, productId } = await params
    const supabase = await createClient()

    // 1. Fetch data for redirection
    const { data: product } = await supabase
        .from('products')
        .select('name, description, keyword, sku, tenant_id, tenants(settings)')
        .eq('id', productId)
        .single()

    if (!product) notFound()

    const tenantSettings = (product.tenants as any)?.settings || {}
    const lineId = tenantSettings.line?.line_id

    if (!lineId) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 text-center">
                <div>
                    <h1 className="text-xl font-bold mb-2">尚未設定 LINE 官方帳號</h1>
                    <p className="text-muted-foreground">請商店管理員先完成 LINE Bot 設定。</p>
                </div>
            </div>
        )
    }

    // 2. Format the message (Same logic as ProductList)
    const identifier = product.keyword || product.sku
    const lineMsg = `我要購買：${product.name}\n` +
        `商品編號：${identifier} +1\n` +
        `--------------------------\n` +
        `(點擊送出即可加入購物車)`;

    const cleanId = lineId.startsWith('@') ? lineId : `@${lineId}`
    const lineUrl = `https://line.me/R/oaMessage/${cleanId}/?${encodeURIComponent(lineMsg)}`

    // 3. Client-side redirect + Server-side fallback
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <h1 className="text-2xl font-bold mb-2">正在前往 LINE...</h1>
            <p className="text-muted-foreground mb-8">即將為您開啟官方帳號喊單畫面</p>
            
            <a 
                href={lineUrl}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#06C755] text-white font-bold rounded-full hover:bg-[#05b34c] transition-colors"
            >
                點此手動跳轉
            </a>

            {/* Client-side Auto Redirect */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    setTimeout(function() {
                        window.location.href = "${lineUrl}";
                    }, 100);
                `
            }} />
        </div>
    )
}
