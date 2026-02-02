import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

interface Props {
    params: Promise<{ id: string }>
}

// 動態生成 SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()

    const { data: product } = await supabase
        .from('products')
        .select('name, description, seo_title, seo_description, seo_keywords, image_url')
        .eq('id', id)
        .eq('status', 'active')
        .single()

    if (!product) return { title: '商品不存在' }

    return {
        title: product.seo_title || product.name,
        description: product.seo_description || product.description || undefined,
        keywords: product.seo_keywords || undefined,
        openGraph: {
            title: product.seo_title || product.name,
            description: product.seo_description || product.description || undefined,
            images: product.image_url ? [product.image_url] : undefined,
        },
    }
}

export default async function HQProductPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    // 取得商品
    const { data: product } = await supabase
        .from('products')
        .select('*, tenants(name, slug)')
        .eq('id', id)
        .eq('status', 'active')
        .single()

    if (!product) {
        notFound()
    }

    // 取得總部商店名稱
    const { data: hqStore } = await supabase
        .from('tenants')
        .select('name')
        .eq('slug', 'hq')
        .single()

    const storeName = hqStore?.name || 'OMOSELECT'

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b bg-white sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/home" className="text-xl font-bold">{storeName}</Link>
                    <nav className="flex gap-6 items-center">
                        <Link href="/home" className="text-gray-600 hover:text-black">首頁</Link>
                        <Link href="/p/about" className="text-gray-600 hover:text-black">關於我們</Link>
                    </nav>
                </div>
            </header>

            {/* Product Content */}
            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                無圖片
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        {product.brand && (
                            <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                        )}
                        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

                        <p className="text-3xl font-bold text-emerald-600 mb-6">
                            NT$ {Number(product.price).toLocaleString()}
                        </p>

                        {product.description && (
                            <div className="prose prose-gray mb-8">
                                <p>{product.description}</p>
                            </div>
                        )}

                        <div className="flex gap-4 mt-auto">
                            <button className="flex-1 bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                加入購物車
                            </button>
                        </div>

                        {/* Stock Info */}
                        <p className="text-sm text-gray-500 mt-4">
                            庫存：{product.stock > 0 ? `${product.stock} 件` : '已售完'}
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-8 mt-12">
                <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} {storeName}. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
