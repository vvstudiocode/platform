'use client'

import { useCart } from "@/lib/cart-context"
import { useState, useEffect } from "react"
import { Check, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from '@/lib/supabase/client'

// NewsFeature Component
interface ProductItem {
    id: string
    image: string
    brand: string
    title: string
    note: string
    colors: string[] // Hex codes
    buttonText?: string
    price: number
    originalPrice?: number
    maxStock: number
    // For variant handling
    variants?: any[]
    options?: any[]
}

interface NewsFeatureProps {
    sectionTitle: string // "TOP" or "BOTTOM"
    brandText?: string
    productIds?: string[]
    // Fallback for manual entry (legacy support or if no ids)
    mainProduct?: any
    subProducts?: any[]

    // Custom Text
    newArrivalsText?: string
    lookbookText?: string

    // Styles
    primaryColor?: string
    backgroundColor?: string
    textColor?: string

    // Spacing & Fonts
    paddingYDesktop?: number
    paddingYMobile?: number
    fontSizeDesktop?: number
    fontSizeMobile?: number

    isMobile?: boolean
}

export function NewsFeature({
    sectionTitle = "TOP",
    brandText = "NOTHING BUT YOU X LYCRA®",
    productIds = [],
    mainProduct: defaultMain,
    subProducts: defaultSub,
    newArrivalsText = "NEW ARRIVALS",
    lookbookText = "LOOKBOOK",
    primaryColor = "#5A7ABC",
    backgroundColor = "#FFFDF7",
    textColor = "#333333",
    paddingYDesktop = 64,
    paddingYMobile = 32,
    fontSizeDesktop = 120, // Default large size
    fontSizeMobile = 80,   // Default mobile size
    isMobile = false,
}: NewsFeatureProps) {
    const { addItem } = useCart()
    const [fetchedProducts, setFetchedProducts] = useState<ProductItem[]>([])

    // Helper to strip parentheses and redundant whitespace
    const cleanDescription = (text: string) => {
        if (!text) return ''
        // Strip leading/trailing parentheses and trim
        return text.replace(/^\s*\(\s*|\s*\)\s*$/g, '').trim()
    }

    // Load products from Supabase
    useEffect(() => {
        async function loadProducts() {
            if (!productIds || productIds.length === 0) return

            const supabase = createClient()
            const { data } = await supabase
                .from('products')
                .select('*, variants:product_variants(*)')
                .in('id', productIds)

            if (data) {
                // Sort by the order of productIds
                const sorted = productIds
                    .map(id => data.find(p => p.id === id))
                    .filter((p): p is NonNullable<typeof p> => !!p)
                    .map(p => ({
                        id: p.id,
                        image: (p.image_url && p.image_url.trim() !== "") ? p.image_url : 'https://placehold.co/600x800',
                        brand: p.brand || '',
                        title: p.name,
                        note: cleanDescription(p.description || ''),
                        colors: [],
                        price: p.price,
                        maxStock: p.stock ?? 0,
                        variants: p.variants || [],
                        options: p.options ? (p.options as any) : []
                    }))
                setFetchedProducts(sorted)
            }
        }

        loadProducts()
    }, [productIds])

    // Determine content to show: Fetched > Props > Defaults
    const displayProducts = fetchedProducts.length > 0 ? fetchedProducts : (
        defaultMain ? [defaultMain, ...(defaultSub || [])] : []
    )

    const mainItem = displayProducts[0] || {
        id: "demo-1",
        image: "https://placehold.co/600x800",
        brand: "LYCRA®",
        title: "可調式運動BRA TOP",
        note: "象牙白、淺藍",
        colors: ['#E8E4D9', '#A5B3CE'],
        price: 1280,
        maxStock: 10
    }

    const subItems = displayProducts.slice(1)
    const finalSubItems = subItems.length > 0 ? subItems : (fetchedProducts.length === 0 ? (defaultSub || []) : [])

    // Helper to render a product card
    const ProductCard = ({ item, isMain = false }: { item: ProductItem, isMain?: boolean }) => {
        const [isAdded, setIsAdded] = useState(false)

        const handleAddToCart = () => {
            if (!item.id || !item.price) return

            // If product has variants/options, redirect to product page or show modal
            // In NewsFeature, we'll keep it simple: if variants, we link to product page
            const hasVariants = (item.variants && item.variants.length > 0) || (item.options && item.options.length > 0)

            if (hasVariants) {
                window.location.href = `/product/${item.id}`
                return
            }

            addItem({
                productId: item.id,
                name: item.title,
                price: item.price,
                image: item.image,
                quantity: 1,
                maxStock: item.maxStock || 10
            })
            setIsAdded(true)
            setTimeout(() => setIsAdded(false), 2000)
        }

        return (
            <div className={`flex flex-col h-full ${isMain ? 'relative' : ''}`}>

                {/* Image - Height Adjusted for Desktop Main (aspect-[3/4]) */}
                <div className={`${isMain ? 'aspect-[3/4]' : 'aspect-[3/4] mb-4'} overflow-hidden cursor-pointer`}
                    onClick={() => window.location.href = `/product/${item.id}`}
                >
                    <img
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        src={item.image}
                    />
                </div>

                {/* Product Info (Below Image) */}
                <div className="mt-4 flex flex-col flex-grow">
                    <p
                        className="text-sm font-bold mb-2 line-clamp-2 min-h-[2.5em] cursor-pointer hover:underline"
                        style={{ color: textColor }}
                        onClick={() => window.location.href = `/product/${item.id}`}
                    >
                        {item.title}
                    </p>

                    {/* Description (Note) - Cleanly displayed */}
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{cleanDescription(item.note)}</p>

                    {/* Price & Cart Alignment */}
                    <div className="mt-auto pt-2 flex items-center justify-between">
                        {item.price && (
                            <div className="font-medium text-sm" style={{ color: textColor }}>
                                NT$ {item.price.toLocaleString()}
                            </div>
                        )}

                        <button
                            onClick={handleAddToCart}
                            disabled={item.maxStock <= 0}
                            className={cn(
                                "w-8 h-8 flex items-center justify-center transition-all duration-300 rounded-full border ml-auto",
                                isAdded ? "bg-black text-white border-black" : "bg-transparent"
                            )}
                            style={{
                                borderColor: textColor,
                                color: isAdded ? '#fff' : textColor
                            }}
                            title="Add to Cart"
                        >
                            {isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <section
            className="w-full font-sans transition-colors duration-300"
            style={{
                backgroundColor: backgroundColor,
                color: textColor,
                paddingTop: isMobile ? paddingYMobile : paddingYDesktop,
                paddingBottom: isMobile ? paddingYMobile : paddingYDesktop,
            }}
        >
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div
                    className={cn("flex flex-col justify-between items-start mb-8", isMobile ? "" : "md:flex-row")}
                    style={{ color: textColor }}
                >
                    <div className="mb-6 md:mb-0">
                        <span className="text-xs font-bold tracking-widest block mb-2">{brandText}</span>
                        <h2
                            className="font-serif leading-none relative z-10 -mb-12 md:-mb-16 mix-blend-multiply opacity-90"
                            style={{
                                fontSize: isMobile ? fontSizeMobile : fontSizeDesktop,
                                color: primaryColor
                            }}
                        >
                            {sectionTitle}
                        </h2>
                    </div>
                    {!isMobile && (
                        <>
                            <div className="text-right hidden md:block">
                                <span className="text-xs font-bold tracking-widest block mb-1">{newArrivalsText}</span>
                            </div>
                            <div className="text-right hidden md:block">
                                <span className="text-xs font-bold tracking-widest block mb-1">{lookbookText}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Content Grid */}
                {/* Use isMobile to force grid-cols-1 if true, else responsive layout */}
                <div className={cn(
                    "grid gap-8 items-start mt-12 md:mt-0",
                    isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-12"
                )}>
                    {/* Main Feature (Left) */}
                    <div className={cn(
                        "relative mt-12 md:mt-0",
                        isMobile ? "" : "md:col-span-5 lg:col-span-4"
                    )}>
                        <ProductCard item={mainItem} isMain={true} />
                    </div>

                    {/* Sub Products (Right) */}
                    <div className={cn(
                        "grid gap-4 md:gap-6",
                        isMobile ? "grid-cols-1" : "grid-cols-3 md:col-span-7 lg:col-span-8"
                    )}>
                        {finalSubItems?.slice(0, 3).map((item, i) => (
                            <ProductCard key={i} item={item} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
