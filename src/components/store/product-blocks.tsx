'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// 商品卡片元件（共用）
function ProductCard({ product, storeSlug }: { product: any; storeSlug: string }) {
    return (
        <Link
            href={`/store/${storeSlug}/product/${product.id}`}
            className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
            {/* 商品圖片 */}
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span>無圖片</span>
                    </div>
                )}
                {/* 庫存標籤 */}
                {product.stock <= 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                        售完
                    </div>
                )}
            </div>

            {/* 商品資訊 */}
            <div className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                    {product.name}
                </h3>
                {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold text-rose-600">
                        NT$ {product.price.toLocaleString()}
                    </div>
                    {product.stock <= 0 ? (
                        <div className="text-sm font-medium text-red-500">已售完</div>
                    ) : null}
                </div>
            </div>
        </Link>
    )
}

// 商品列表元件（支援從資料庫讀取）
export function ProductListBlock({
    productIds,
    title,
    layout = 'grid',
    columns = 3,
    storeSlug,
    preview
}: {
    productIds: string[]
    title?: string
    layout?: 'grid' | 'list'
    columns?: number
    storeSlug: string
    preview?: boolean
}) {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadProducts() {
            if (!productIds || productIds.length === 0) {
                setLoading(false)
                return
            }

            const supabase = createClient()
            let query = supabase
                .from('products')
                .select('*')
                .in('id', productIds)

            if (!preview) {
                query = query.eq('status', 'active')
            }

            const { data } = await query

            if (data) {
                // 按照 productIds 的順序排列
                const sorted = productIds
                    .map(id => data.find(p => p.id === id))
                    .filter(Boolean)
                setProducts(sorted)
            }
            setLoading(false)
        }

        loadProducts()
    }, [productIds])

    if (loading) {
        return (
            <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-600 border-r-transparent"></div>
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500">
                {title && <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>}
                <p>目前沒有商品</p>
            </div>
        )
    }

    return (
        <div className="py-8 space-y-6">
            {title && <h2 className="text-3xl font-bold text-gray-900">{title}</h2>}
            <div className={
                layout === 'grid'
                    ? `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-6`
                    : 'space-y-4'
            }>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
                ))}
            </div>
        </div>
    )
}

// 商品分類元件（從資料庫讀取分類）
export function ProductCategoryBlock({
    category,
    title,
    limit = 8,
    layout = 'grid',
    columns = 3,
    storeSlug,
    tenantId,
    preview
}: {
    category: string
    title?: string
    limit?: number
    layout?: 'grid' | 'list'
    columns?: number
    storeSlug: string
    tenantId: string
    preview?: boolean
}) {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadProducts() {
            if (!category) {
                setLoading(false)
                return
            }

            const supabase = createClient()
            let query = supabase
                .from('products')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('category', category)

            if (!preview) {
                query = query.eq('status', 'active')
            }

            const { data } = await query
                .limit(limit)
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false })

            if (data) {
                setProducts(data)
            }
            setLoading(false)
        }

        loadProducts()
    }, [category, tenantId, limit])

    if (loading) {
        return (
            <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-600 border-r-transparent"></div>
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500">
                {title && <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>}
                <p>目前「{category}」分類沒有商品</p>
            </div>
        )
    }

    return (
        <div className="py-8 space-y-6">
            {title && <h2 className="text-3xl font-bold text-gray-900">{title}</h2>}
            <div className={
                layout === 'grid'
                    ? `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-6`
                    : 'space-y-4'
            }>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
                ))}
            </div>
        </div>
    )
}

// 商品輪播元件
export function ProductCarouselBlock({
    productIds,
    title,
    autoplay = true,
    interval = 5,
    storeSlug,
    preview
}: {
    productIds: string[]
    title?: string
    autoplay?: boolean
    interval?: number
    storeSlug: string
    preview?: boolean
}) {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        async function loadProducts() {
            if (!productIds || productIds.length === 0) {
                setLoading(false)
                return
            }

            const supabase = createClient()
            let query = supabase
                .from('products')
                .select('*')
                .in('id', productIds)

            if (!preview) {
                // query = query.eq('status', 'active') // 暫時移除狀態檢查以解決預覽問題，或者只在非預覽時檢查
                query = query.eq('status', 'active')
            }

            const { data } = await query

            if (data) {
                const sorted = productIds
                    .map(id => data.find(p => p.id === id))
                    .filter(Boolean)
                setProducts(sorted)
            }
            setLoading(false)
        }

        loadProducts()
    }, [productIds])

    // 自動輪播
    useEffect(() => {
        if (!autoplay || products.length === 0) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length)
        }, interval * 1000)

        return () => clearInterval(timer)
    }, [autoplay, interval, products.length])

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
    }

    if (loading) {
        return (
            <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-600 border-r-transparent"></div>
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500">
                {title && <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>}
                <p>目前沒有商品</p>
            </div>
        )
    }

    // 顯示 3 個商品（當前 + 前後各一個）
    const displayCount = 3
    const getVisibleProducts = () => {
        const visible = []
        for (let i = 0; i < Math.min(displayCount, products.length); i++) {
            const index = (currentIndex + i) % products.length
            visible.push(products[index])
        }
        return visible
    }

    return (
        <div className="py-8 space-y-6">
            {title && <h2 className="text-3xl font-bold text-gray-900">{title}</h2>}

            <div className="relative">
                {/* 商品展示 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {getVisibleProducts().map((product, i) => (
                        <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
                    ))}
                </div>

                {/* 導航按鈕 */}
                {products.length > displayCount && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 text-gray-600" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                        >
                            <ChevronRight className="h-6 w-6 text-gray-600" />
                        </button>
                    </>
                )}

                {/* 指示器 */}
                <div className="flex justify-center gap-2 mt-6">
                    {products.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-2 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-rose-600' : 'w-2 bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
