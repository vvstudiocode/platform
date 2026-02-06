'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// 靜態映射以確保 Tailwind 能抓取到 class
const GRID_COLS: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
}

const MD_GRID_COLS: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
}

// 商品卡片元件（共用）
function ProductCard({ product, storeSlug, fitDesktop = 'cover', fitMobile = 'cover', aspectRatioDesktop = '1/1', aspectRatioMobile = '1/1' }: { product: any; storeSlug: string; fitDesktop?: string; fitMobile?: string; aspectRatioDesktop?: string; aspectRatioMobile?: string }) {
    return (
        <Link
            href={`/store/${storeSlug}/product/${product.id}`}
            className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
            {/* 商品圖片 */}
            <div
                className="relative overflow-hidden bg-gray-100 aspect-[var(--aspect-mobile)] md:aspect-[var(--aspect-desktop)]"
                style={{
                    '--aspect-desktop': typeof fitDesktop === 'string' && fitDesktop.includes('/') ? fitDesktop : '1/1',
                    '--aspect-mobile': typeof fitMobile === 'string' && fitMobile.includes('/') ? fitMobile : '1/1',
                } as React.CSSProperties}
            >
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full group-hover:scale-110 transition-transform duration-500 object-cover"
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

// Helper for Title Alignment
const getTitleClass = (align?: string) => {
    return {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }[align || 'center'] || 'text-start' // default to start/left if undefined, or center? User said "center all titles globally" in a previous turn, but here I should support the prop.
}

// 商品列表元件（支援從資料庫讀取）
export function ProductListBlock({
    productIds,
    title,
    titleAlign,
    layout, // Legacy fallback
    columns, // Legacy fallback
    layoutDesktop,
    columnsDesktop,
    layoutMobile,
    columnsMobile,
    storeSlug,
    preview,
    previewDevice = 'desktop',
    objectFitDesktop = 'cover',
    objectFitMobile = 'cover',
    aspectRatioDesktop = '1/1',
    aspectRatioMobile = '1/1'
}: {
    productIds: string[]
    title?: string
    titleAlign?: string
    layout?: 'grid' | 'list'
    columns?: number
    layoutDesktop?: 'grid' | 'list'
    columnsDesktop?: number
    layoutMobile?: 'grid' | 'list'
    columnsMobile?: number
    storeSlug: string
    preview?: boolean
    previewDevice?: 'mobile' | 'desktop'
    objectFitDesktop?: 'cover' | 'contain'
    objectFitMobile?: 'cover' | 'contain'
    aspectRatioDesktop?: string
    aspectRatioMobile?: string
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
                const sorted = productIds
                    .map(id => data.find(p => p.id === id))
                    .filter(Boolean)
                setProducts(sorted)
            }
            setLoading(false)
        }

        loadProducts()
    }, [productIds, preview])

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
                {title && <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${getTitleClass(titleAlign)}`}>{title}</h2>}
                <p>目前沒有商品</p>
            </div>
        )
    }

    // Default Settings
    const dLayout = layoutDesktop || layout || 'grid'
    const dCols = columnsDesktop || columns || 3
    const mLayout = layoutMobile || 'grid'
    const mCols = columnsMobile || 1

    // Build Responsive Classes
    let className = ''

    // Mobile Base
    if (mLayout === 'list') {
        className += 'flex flex-col gap-4 '
    } else {
        // 使用映射表
        const colClass = GRID_COLS[mCols] || 'grid-cols-1'
        className += `grid ${colClass} gap-4 `
    }

    // Desktop Override
    if (preview && previewDevice === 'mobile') {
        // Do nothing for mobile preview
    } else if (dLayout === 'list') {
        className += 'md:flex md:flex-col md:gap-6 '
    } else {
        // 使用映射表
        const colClass = MD_GRID_COLS[dCols] || 'md:grid-cols-3'
        className += `md:grid md:gap-6 ${colClass} `
    }

    return (
        <div className="py-8 space-y-6">
            {title && <h2 className={`text-3xl font-bold text-gray-900 ${getTitleClass(titleAlign)}`}>{title}</h2>}
            <div className={className}>
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
    titleAlign,
    limit = 8,
    layout,
    columns,
    layoutDesktop,
    columnsDesktop,
    layoutMobile,
    columnsMobile,
    storeSlug,
    tenantId,
    preview,
    previewDevice = 'desktop',
    objectFitDesktop = 'cover',
    objectFitMobile = 'cover',
    aspectRatioDesktop = '1/1',
    aspectRatioMobile = '1/1'
}: {
    category: string
    title?: string
    titleAlign?: string
    limit?: number
    layout?: 'grid' | 'list'
    columns?: number
    layoutDesktop?: 'grid' | 'list'
    columnsDesktop?: number
    layoutMobile?: 'grid' | 'list'
    columnsMobile?: number
    storeSlug: string
    tenantId: string
    preview?: boolean
    previewDevice?: 'mobile' | 'desktop'
    objectFitDesktop?: 'cover' | 'contain'
    objectFitMobile?: 'cover' | 'contain'
    aspectRatioDesktop?: string
    aspectRatioMobile?: string
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
    }, [category, tenantId, limit, preview])

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
                {title && <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${getTitleClass(titleAlign)}`}>{title}</h2>}
                <p>目前「{category}」分類沒有商品</p>
            </div>
        )
    }

    // Default Settings
    const dLayout = layoutDesktop || layout || 'grid'
    const dCols = columnsDesktop || columns || 3
    const mLayout = layoutMobile || 'grid'
    const mCols = columnsMobile || 1

    // Build Responsive Classes
    let className = ''

    // Mobile Base
    if (mLayout === 'list') {
        className += 'flex flex-col gap-4 '
    } else {
        // 使用映射表
        const colClass = GRID_COLS[mCols] || 'grid-cols-1'
        className += `grid ${colClass} gap-4 `
    }

    // Desktop Override
    if (preview && previewDevice === 'mobile') {
        // Do nothing for mobile preview
    } else if (dLayout === 'list') {
        className += 'md:flex md:flex-col md:gap-6 '
    } else {
        // 使用映射表
        const colClass = MD_GRID_COLS[dCols] || 'md:grid-cols-3'
        className += `md:grid md:gap-6 ${colClass} `
    }

    return (
        <div className="py-8 space-y-6">
            {title && <h2 className={`text-3xl font-bold text-gray-900 ${getTitleClass(titleAlign)}`}>{title}</h2>}
            <div className={className}>
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        storeSlug={storeSlug}
                        fitDesktop={objectFitDesktop}
                        fitMobile={objectFitMobile}
                        aspectRatioDesktop={aspectRatioDesktop}
                        aspectRatioMobile={aspectRatioMobile}
                    />
                ))}
            </div>
            <div className="text-center">
                <Link href={`/store/${storeSlug}/products?category=${category}`} className="inline-block px-6 py-2 border border-gray-900 text-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-colors">
                    查看更多
                </Link>
            </div>
        </div>
    )
}

// 商品輪播元件
export function ProductCarouselBlock({
    productIds,
    title,
    titleAlign,
    autoplay = true,
    interval = 5,
    storeSlug,
    preview,
    previewDevice = 'desktop',
    objectFitDesktop = 'cover',
    objectFitMobile = 'cover',
    aspectRatioDesktop = '1/1',
    aspectRatioMobile = '1/1'
}: {
    productIds: string[]
    title?: string
    titleAlign?: string
    autoplay?: boolean
    interval?: number
    storeSlug: string
    preview?: boolean
    previewDevice?: 'mobile' | 'desktop'
    objectFitDesktop?: 'cover' | 'contain'
    objectFitMobile?: 'cover' | 'contain'
    aspectRatioDesktop?: string
    aspectRatioMobile?: string
}) {
    const [products, setProducts] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            if (productIds.length === 0) {
                setLoading(false)
                return
            }
            try {
                const res = await fetch(`/api/products/batch?ids=${productIds.join(',')}`)
                const data = await res.json()
                setProducts(data.products || [])
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [JSON.stringify(productIds)])

    useEffect(() => {
        if (!autoplay || products.length <= (preview && previewDevice === 'mobile' ? 1 : 4)) return
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % products.length)
        }, interval * 1000)
        return () => clearInterval(timer)
    }, [autoplay, interval, products.length, preview, previewDevice])


    const nextSlide = () => {
        setCurrentIndex(prev => (prev + 1) % products.length)
    }

    const prevSlide = () => {
        setCurrentIndex(prev => (prev - 1 + products.length) % products.length)
    }

    if (loading) return <div className="py-12 text-center text-gray-400">載入輪播中...</div>
    if (products.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500">
                {title && <h2 className={`text-3xl font-bold text-gray-900 mb-6 ${getTitleClass(titleAlign)}`}>{title}</h2>}
                <p>目前沒有商品</p>
            </div>
        )
    }

    const isMobile = preview && previewDevice === 'mobile'
    const itemWidthClass = isMobile ? 'w-full' : 'w-full md:w-1/2 lg:w-1/4'

    return (
        <div className="py-8 space-y-6 group relative">
            <div className={`px-1 ${getTitleClass(titleAlign)}`}>
                {title && <h2 className="text-3xl font-bold text-gray-900">{title}</h2>}
            </div>

            <div className="relative overflow-hidden -mx-4 px-4 py-4">
                <div
                    className="flex transition-transform duration-500 ease-out will-change-transform"
                    style={{
                        transform: `translateX(-${currentIndex * (isMobile ? 100 : 25)}%)`
                    }}
                >
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className={`flex-shrink-0 px-3 ${itemWidthClass} transition-opacity duration-300`}
                        >
                            <ProductCard
                                product={product}
                                storeSlug={storeSlug}
                                fitDesktop={objectFitDesktop}
                                fitMobile={objectFitMobile}
                                aspectRatioDesktop={aspectRatioDesktop}
                                aspectRatioMobile={aspectRatioMobile}
                            />
                        </div>
                    ))}
                </div>

                {products.length > (isMobile ? 1 : 4) && (
                    <>
                        <button
                            onClick={(e) => { e.preventDefault(); prevSlide() }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white shadow-lg rounded-r-lg text-gray-800 transition-all z-20 backdrop-blur-sm border-y border-r border-gray-100"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); nextSlide() }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white shadow-lg rounded-l-lg text-gray-800 transition-all z-20 backdrop-blur-sm border-y border-l border-gray-100"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>

            {
                products.length > 0 && (
                    <div className="flex justify-center gap-1.5 mt-2">
                        {products.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-rose-600' : 'w-1.5 bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                )
            }
        </div>
    )
}
