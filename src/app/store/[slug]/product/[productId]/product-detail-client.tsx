'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import Link from 'next/link'
import { CartSidebar } from '@/components/store/cart-sidebar'
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
        options: Record<string, string[]>
        variants: Array<{
            sku?: string
            price?: number
            stock?: number
            [key: string]: any
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
    const { addItem, getItemCount, setStoreSlug } = useCart()
    const [quantity, setQuantity] = useState(1)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isAdded, setIsAdded] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setStoreSlug(store.slug)

        // 初始化選項
        if (product.options) {
            const initial: Record<string, string> = {}
            Object.entries(product.options).forEach(([key, values]) => {
                if (values && values.length > 0) {
                    initial[key] = values[0]
                }
            })
            setSelectedOptions(initial)
        }
    }, [store.slug, setStoreSlug, product.options])

    const allImages = product.image_url
        ? [product.image_url, ...(product.images || [])]
        : (product.images || [])

    const [selectedImage, setSelectedImage] = useState(0)

    // 計算當前選項的庫存
    const getCurrentStock = () => {
        if (product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => {
                return Object.entries(selectedOptions).every(([key, value]) => v[key] === value)
            })
            return variant?.stock ?? product.stock
        }
        return product.stock
    }

    const currentStock = getCurrentStock()

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url || undefined,
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
                logoUrl={undefined} // Modify if logo is available in props
                navItems={navItems || []}
                homeSlug={homeSlug}
                basePath={`/store/${store.slug}`}
            />

            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div>
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            {allImages[selectedImage] ? (
                                <img
                                    src={allImages[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    無圖片
                                </div>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="flex gap-2 mt-4 overflow-x-auto">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden border-2 ${selectedImage === idx ? 'border-rose-500' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {product.brand && (
                            <p className="text-sm text-gray-500">{product.brand}</p>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-3xl font-bold text-rose-500">
                            NT$ {Number(product.price).toLocaleString()}
                        </p>

                        {product.description && (
                            <div className="prose prose-gray">
                                <p className="whitespace-pre-wrap">{product.description}</p>
                            </div>
                        )}

                        {/* Options */}
                        {product.options && Object.keys(product.options).length > 0 && (
                            <div className="space-y-4">
                                {Object.entries(product.options).map(([optionName, values]) => (
                                    <div key={optionName}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {optionName}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {values.map((value) => (
                                                <button
                                                    key={value}
                                                    onClick={() => setSelectedOptions(prev => ({
                                                        ...prev,
                                                        [optionName]: value
                                                    }))}
                                                    className={`px-4 py-2 border rounded-lg text-sm ${selectedOptions[optionName] === value
                                                        ? 'border-rose-500 bg-rose-50 text-rose-600'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">數量：</span>
                            <div className="flex items-center rounded-md border border-gray-300">
                                <button
                                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                    className="px-3 py-1 text-gray-600 hover:text-black disabled:opacity-50"
                                    disabled={currentStock <= 0}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-2 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => quantity < currentStock && setQuantity(quantity + 1)}
                                    className="px-3 py-1 text-gray-600 hover:text-black disabled:opacity-50"
                                    disabled={currentStock <= 0 || quantity >= currentStock}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={currentStock <= 0}
                                className={`w-full py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isAdded
                                    ? 'bg-green-500 text-white'
                                    : currentStock > 0
                                        ? 'bg-rose-500 hover:bg-rose-600 text-white'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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

            {/* Cart Sidebar */}
            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                storeSlug={store.slug}
            />
        </div>
    )
}
