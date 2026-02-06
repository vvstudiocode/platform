'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
    productId: string
    variantId?: string
    name: string
    price: number
    quantity: number
    image?: string
    options?: Record<string, string>
    maxStock: number
    sku?: string
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
    removeItem: (productId: string, variantId?: string, options?: Record<string, string>) => void
    updateQuantity: (productId: string, quantity: number, variantId?: string, options?: Record<string, string>) => void
    clearCart: () => void
    getItemCount: () => number
    getCartTotal: () => number
    storeSlug: string | null
    setStoreSlug: (slug: string) => void
    isCartOpen: boolean
    setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// 使用商店專屬的 localStorage key，確保不同商店的購物車資料隔離
const getCartStorageKey = (slug: string | null) => `cart_${slug || 'default'}`

const getItemKey = (productId: string, variantId?: string, options?: Record<string, string>) => {
    if (variantId) return `${productId}-${variantId}`
    if (!options) return productId
    // Create a stable key from options
    const optionsKey = Object.entries(options)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join('|')
    return `${productId}-${optionsKey}`
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [storeSlug, setStoreSlugState] = useState<string | null>(null)
    const [isHydrated, setIsHydrated] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)

    // 從 localStorage 載入購物車（當 storeSlug 改變時重新載入）
    useEffect(() => {
        if (!storeSlug) return

        const stored = localStorage.getItem(getCartStorageKey(storeSlug))
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setItems(parsed.items || [])
            } catch (e) {
                console.error('Failed to parse cart:', e)
                setItems([])
            }
        } else {
            setItems([])
        }
        setIsHydrated(true)
    }, [storeSlug])

    // 儲存到 localStorage（商店專屬）
    useEffect(() => {
        if (isHydrated && storeSlug) {
            localStorage.setItem(getCartStorageKey(storeSlug), JSON.stringify({ items }))
        }
    }, [items, storeSlug, isHydrated])

    // 當設定新的 storeSlug 時，重置購物車狀態
    const setStoreSlug = (slug: string) => {
        if (slug !== storeSlug) {
            setIsHydrated(false)
            setStoreSlugState(slug)
        }
    }

    const getItemKey = (productId: string, variantId?: string, options?: Record<string, string>) => {
        if (variantId) return `${productId}-${variantId}`
        if (options) {
            // Create a stable key from options
            const optionsKey = Object.entries(options)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => `${k}:${v}`)
                .join('|')
            return `${productId}-${optionsKey}`
        }
        return productId
    }

    const addItem = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
        setItems(prev => {
            const quantity = newItem.quantity || 1
            const newItemKey = getItemKey(newItem.productId, newItem.variantId, newItem.options)

            const existingIndex = prev.findIndex(item =>
                getItemKey(item.productId, item.variantId, item.options) === newItemKey
            )

            if (existingIndex > -1) {
                const newItems = [...prev]
                const item = newItems[existingIndex]
                const newQuantity = Math.min(item.quantity + quantity, item.maxStock)

                newItems[existingIndex] = {
                    ...item,
                    quantity: newQuantity
                }
                return newItems
            }

            return [...prev, { ...newItem, quantity }]
        })
        setIsCartOpen(true)
    }

    const removeItem = (productId: string, variantId?: string, options?: Record<string, string>) => {
        setItems(prev => prev.filter(item =>
            getItemKey(item.productId, item.variantId, item.options) !== getItemKey(productId, variantId, options)
        ))
    }

    const updateQuantity = (productId: string, quantity: number, variantId?: string, options?: Record<string, string>) => {
        setItems(prev => prev.map(item => {
            if (getItemKey(item.productId, item.variantId, item.options) === getItemKey(productId, variantId, options)) {
                return { ...item, quantity: Math.min(Math.max(0, quantity), item.maxStock) }
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const clearCart = () => {
        setItems([])
    }

    const getItemCount = () => {
        return items.reduce((sum, item) => sum + item.quantity, 0)
    }

    const getCartTotal = () => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            getItemCount,
            getCartTotal,
            storeSlug,
            setStoreSlug,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
