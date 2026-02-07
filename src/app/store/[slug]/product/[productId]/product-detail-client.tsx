'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCart } from '@/lib/cart-context'
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

interface Props {
    store: {
        name: string
        slug: string
    }
    product: {
        id: string
        name: string
        description: string | null
        price: number
        stock: number
        image_url: string | null
        images: string[]
        brand: string | null
        options: { id: string; name: string; values: string[] }[]
        variants: Array<{
            id: string
            options: Record<string, string>
            price: number
            stock: number
            sku: string | null
        }>
    }
    navItems?: Array<{
        id: string
        title: string
        slug: string
        is_homepage: boolean
        parent_id?: string | null
        position: number
    }>
    homeSlug?: string
}

export function ProductDetailClient({ store, product, navItems, homeSlug }: Props) {
    const { addItem, getItemCount, setStoreSlug, isCartOpen, setIsCartOpen } = useCart()
    const [quantity, setQuantity] = useState(1)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
    const [isAdded, setIsAdded] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setStoreSlug(store.slug)

        // 初始化選項
        if (product.options && Array.isArray(product.options)) {
            const initial: Record<string, string> = {}
            product.options.forEach((option) => {
                if (option.values && option.values.length > 0) {
                    initial[option.name] = option.values[0]
                }
            })
            setSelectedOptions(initial)
        }
    }, [store.slug, setStoreSlug, product.options])

    const allImages = useMemo(() => {
        const imgs = []
        if (product.image_url) imgs.push(product.image_url)
        if (product.images && product.images.length > 0) {
            // Avoid duplicates if image_url is also in images
            product.images.forEach(img => {
                if (img !== product.image_url) imgs.push(img)
            })
        }
        return imgs.length > 0 ? imgs : []
    }, [product.image_url, product.images])

    const [selectedImage, setSelectedImage] = useState(0)

    // 取得當前選中的 Variant
    const currentVariant = useMemo(() => {
        if (!product.variants || product.variants.length === 0) return null
        return product.variants.find(v => {
            // Check if all selected options match the variant's options
            // Note: v.options might be a JSON object from DB
            const vOptions = v.options || {}
            if (Object.keys(selectedOptions).length !== Object.keys(vOptions).length) return false
            return Object.entries(selectedOptions).every(([key, value]) => vOptions[key] === value)
        })
    }, [product.variants, selectedOptions])

    // 計算當前顯示的價格與庫存
    const currentPrice = currentVariant ? currentVariant.price : product.price
    const currentStock = currentVariant ? currentVariant.stock : product.stock

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            variantId: currentVariant?.id,
            name: product.name,
            price: currentPrice,
            image: allImages[0], // Use first image as thumbnail
            options: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
            maxStock: currentStock,
            quantity,
        })
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <SiteHeader
                storeName={store.name}
                logoUrl={undefined}
                navItems={navItems || []}
                homeSlug={homeSlug}
                basePath={store.slug === 'omo' ? '' : `/store/${store.slug}`}
                onCartClick={() => setIsCartOpen(true)}
            />

            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100 relative">
                            {allImages[selectedImage] ? (
                                <img
                                    src={allImages[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    無圖片
                                </div>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-zinc-900 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 mb-4">{product.name}</h1>
                            <p className="text-2xl font-bold text-zinc-900">
                                NT$ {Number(currentPrice).toLocaleString()}
                            </p>
                        </div>

                        {product.description && (
                            <div className="prose prose-zinc prose-sm text-zinc-600">
                                <p className="whitespace-pre-wrap">{product.description}</p>
                            </div>
                        )}

                        <div className="space-y-6 pt-6 border-t border-zinc-100">
                            {/* Options */}
                            {product.options && product.options.length > 0 && (
                                <div className="space-y-4">
                                    {product.options.map((option) => (
                                        <div key={option.name}>
                                            <label className="block text-sm font-medium text-zinc-700 mb-3">
                                                {option.name}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {option.values.map((value) => {
                                                    const isSelected = selectedOptions[option.name] === value
                                                    return (
                                                        <button
                                                            key={value}
                                                            onClick={() => setSelectedOptions(prev => ({
                                                                ...prev,
                                                                [option.name]: value
                                                            }))}
                                                            className={`px-4 py-2 border rounded-full text-sm font-medium transition-all ${isSelected
                                                                ? 'border-zinc-900 bg-zinc-900 text-white'
                                                                : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                                                                }`}
                                                        >
                                                            {value}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-zinc-700">數量</span>
                                <div className="flex items-center rounded-lg border border-zinc-200 p-1">
                                    <button
                                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                        className="p-2 text-zinc-500 hover:text-black disabled:opacity-30"
                                        disabled={currentStock <= 0}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-12 text-center text-sm font-bold text-zinc-900">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => quantity < currentStock && setQuantity(quantity + 1)}
                                        className="p-2 text-zinc-500 hover:text-black disabled:opacity-30"
                                        disabled={currentStock <= 0 || quantity >= currentStock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <button
                                onClick={handleAddToCart}
                                disabled={currentStock <= 0}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${isAdded
                                    ? 'bg-green-600 text-white'
                                    : currentStock > 0
                                        ? 'bg-zinc-900 hover:bg-black text-white shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-0.5'
                                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                                    }`}
                            >
                                {isAdded ? (
                                    <>
                                        <Check className="h-5 w-5" />
                                        已加入購物車
                                    </>
                                ) : currentStock > 0 ? (
                                    '加入購物車'
                                ) : (
                                    '已售完'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
