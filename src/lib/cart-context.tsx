'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
    productId: string
    name: string
    price: number
    quantity: number
    image?: string
    options?: Record<string, string>
    maxStock: number
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
    removeItem: (productId: string, options?: Record<string, string>) => void
    updateQuantity: (productId: string, quantity: number, options?: Record<string, string>) => void
    clearCart: () => void
    getItemCount: () => number
    getSubtotal: () => number
    storeSlug: string | null
    setStoreSlug: (slug: string) => void
    isCartOpen: boolean
    setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// 使用商店專屬的 localStorage key，確保不同商店的購物車資料隔離
const getCartStorageKey = (slug: string | null) => `cart_${slug || 'default'}`

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

    const getItemKey = (productId: string, options?: Record<string, string>) => {
        return options ? `${productId}_${JSON.stringify(options)}` : productId
    }

    const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
        const quantity = item.quantity || 1

        setItems(prev => {
            const existingIndex = prev.findIndex(
                i => getItemKey(i.productId, i.options) === getItemKey(item.productId, item.options)
            )

            if (existingIndex >= 0) {
                const updated = [...prev]
                const newQty = Math.min(
                    updated[existingIndex].quantity + quantity,
                    updated[existingIndex].maxStock
                )
                updated[existingIndex].quantity = newQty
                return updated
            }

            return [...prev, { ...item, quantity }]
        })
        setIsCartOpen(true) // 自動打開購物車
    }

    const removeItem = (productId: string, options?: Record<string, string>) => {
        setItems(prev => prev.filter(
            i => getItemKey(i.productId, i.options) !== getItemKey(productId, options)
        ))
    }

    const updateQuantity = (productId: string, quantity: number, options?: Record<string, string>) => {
        if (quantity <= 0) {
            removeItem(productId, options)
            return
        }

        setItems(prev => prev.map(item => {
            if (getItemKey(item.productId, item.options) === getItemKey(productId, options)) {
                return { ...item, quantity: Math.min(quantity, item.maxStock) }
            }
            return item
        }))
    }

    const clearCart = () => {
        setItems([])
    }

    const getItemCount = () => {
        return items.reduce((sum, item) => sum + item.quantity, 0)
    }

    const getSubtotal = () => {
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
            getSubtotal,
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
