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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'shopping_cart'

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [storeSlug, setStoreSlug] = useState<string | null>(null)
    const [isHydrated, setIsHydrated] = useState(false)

    // 從 localStorage 載入購物車
    useEffect(() => {
        const stored = localStorage.getItem(CART_STORAGE_KEY)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setItems(parsed.items || [])
                setStoreSlug(parsed.storeSlug || null)
            } catch (e) {
                console.error('Failed to parse cart:', e)
            }
        }
        setIsHydrated(true)
    }, [])

    // 儲存到 localStorage
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, storeSlug }))
        }
    }, [items, storeSlug, isHydrated])

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
