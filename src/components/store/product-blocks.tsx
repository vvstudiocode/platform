'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/cart-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

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

// 商品卡片元件（共用）- 匯出供其他頁面使用
export function ProductCard({ product, storeSlug, fitDesktop = 'cover', fitMobile = 'cover', aspectRatioDesktop = '1/1', aspectRatioMobile = '1/1' }: { product: any; storeSlug: string; fitDesktop?: string; fitMobile?: string; aspectRatioDesktop?: string; aspectRatioMobile?: string }) {
    const { addItem } = useCart()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
    const [isAdded, setIsAdded] = useState(false)
    const [selectedImage, setSelectedImage] = useState(0)

    // Initialize options
    useEffect(() => {
        if (isModalOpen && product.options && Array.isArray(product.options)) {
            const initial: Record<string, string> = {}
            product.options.forEach((option: any) => {
                if (option.values && option.values.length > 0) {
                    initial[option.name] = option.values[0]
                }
            })
            setSelectedOptions(initial)
            setQuantity(1)
            setSelectedImage(0)
        }
    }, [isModalOpen, product.options])

    const allImages = useMemo(() => {
        const imgs = []
        if (product.image_url) imgs.push(product.image_url)
        if (product.images && product.images.length > 0) {
            product.images.forEach((img: string) => {
                if (img !== product.image_url) imgs.push(img)
            })
        }
        return imgs.length > 0 ? imgs : []
    }, [product.image_url, product.images])

    const currentVariant = useMemo(() => {
        if (!product.variants || product.variants.length === 0) return null
        return product.variants.find((v: any) => {
            const vOptions = v.options || {}
            if (Object.keys(selectedOptions).length !== Object.keys(vOptions).length) return false
            return Object.entries(selectedOptions).every(([key, value]) => vOptions[key] === value)
        })
    }, [product.variants, selectedOptions])

    const currentPrice = currentVariant ? currentVariant.price : product.price
    const currentStock = currentVariant ? currentVariant.stock : product.stock

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // If product has multiple variants/options, open modal
        if ((product.variants && product.variants.length > 0) || (product.options && product.options.length > 0)) {
            setIsModalOpen(true)
            return
        }

        // Direct add for simple products
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url,
            maxStock: product.stock,
            quantity: 1,
        })
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    const handleModalAddToCart = () => {
        addItem({
            productId: product.id,
            variantId: currentVariant?.id,
            name: product.name,
            price: currentPrice,
            image: allImages[0],
            options: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
            maxStock: currentStock,
            quantity,
        })
        setIsModalOpen(false)
        // Optional: show global toast or feedback
    }

    const productLink = storeSlug === 'omo' ? `/product/${product.id}` : `/store/${storeSlug}/product/${product.id}`

    return (
        <>
            <div className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Image Area - Link */}
                <Link href={productLink} className="block relative overflow-hidden bg-gray-100 aspect-[var(--aspect-mobile)] md:aspect-[var(--aspect-desktop)]"
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

                    {/* Sold Out Badge - Top Right */}
                    {product.stock <= 0 && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-bold rounded">
                            已售完
                        </div>
                    )}
                </Link>

                {/* Info Area */}
                <div className="p-4 space-y-2">
                    <Link href={productLink}>
                        <h3 className="font-semibold text-gray-900 transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                    </Link>
                    {product.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                        <div className="text-lg font-bold text-rose-600">
                            NT$ {product.price.toLocaleString()}
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                            className={cn(
                                "p-2 rounded-full transition-all duration-300",
                                product.stock <= 0
                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    : isAdded
                                        ? "bg-green-500 text-white shadow-md scale-110"
                                        : "bg-gray-100 text-gray-800 hover:bg-rose-600 hover:text-white hover:shadow-md"
                            )}
                        >
                            {isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Add Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden gap-0 bg-white">
                    <div className="relative aspect-[4/3] bg-gray-100">
                        {allImages[selectedImage] && (
                            <img
                                src={allImages[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        )}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900 mb-1">{product.name}</DialogTitle>
                            <p className="text-lg font-bold text-rose-600">NT$ {Number(currentPrice).toLocaleString()}</p>
                        </div>

                        {/* Options */}
                        {product.options && product.options.map((option: any) => (
                            <div key={option.name} className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{option.name}</label>
                                <div className="flex flex-wrap gap-2">
                                    {option.values.map((value: string) => (
                                        <button
                                            key={value}
                                            onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value }))}
                                            className={cn(
                                                "px-3 py-1.5 text-sm border rounded-full transition-colors",
                                                selectedOptions[option.name] === value
                                                    ? "bg-zinc-900 text-white border-zinc-900"
                                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                            )}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Quantity */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">數量</span>
                            <div className="flex items-center rounded-lg border border-gray-200">
                                <button
                                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                    className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-30"
                                    disabled={currentStock <= 0}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                                <button
                                    onClick={() => quantity < currentStock && setQuantity(quantity + 1)}
                                    className="p-2 hover:bg-gray-50 text-gray-600 disabled:opacity-30"
                                    disabled={currentStock <= 0 || quantity >= currentStock}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handleModalAddToCart}
                            disabled={currentStock <= 0}
                            className="w-full py-3 bg-zinc-900 text-white rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {currentStock > 0 ? '加入購物車' : '已售完'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
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
                .select('*, variants:product_variants(*)')
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
                .select('*, variants:product_variants(*)')
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
