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
    syncWithDB: (tenantId: string, userId?: string) => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// 使用商店專屬的 localStorage key，確保不同商店的購物車資料隔離
const getCartStorageKey = (slug: string | null) => `cart_${slug || 'default'}`

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [storeSlug, setStoreSlugState] = useState<string | null>(null)
    const [isHydrated, setIsHydrated] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [tenantId, setTenantId] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)

    // 1. Initial Load from localStorage
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

    // 2. Sync to localStorage when items change
    useEffect(() => {
        if (isHydrated && storeSlug) {
            localStorage.setItem(getCartStorageKey(storeSlug), JSON.stringify({ items }))
        }
    }, [items, storeSlug, isHydrated])

    // 3. Background Sync to DB (Debounced)
    useEffect(() => {
        if (!isHydrated || !tenantId || !storeSlug) return

        const syncTimer = setTimeout(async () => {
            try {
                // Only sync if we have a way to identify the user (session or userId param)
                // We'll trust the API to handle the auth check
                let url = `/api/cart/sync?tenant_id=${tenantId}`
                if (userId) url += `&user_id=${userId}`

                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items, mode: 'replace' })
                })
            } catch (e) {
                console.warn('[Cart Sync] Background sync failed:', e)
            }
        }, 1500) // 1.5s debounce

        return () => clearTimeout(syncTimer)
    }, [items, tenantId, userId, isHydrated, storeSlug])

    const setStoreSlug = (slug: string) => {
        if (slug !== storeSlug) {
            setIsHydrated(false)
            setStoreSlugState(slug)
        }
    }

    const syncWithDB = async (tId: string, uId?: string) => {
        setTenantId(tId)
        if (uId) setUserId(uId)

        try {
            let url = `/api/cart/line?tenant_id=${tId}`
            if (uId) url += `&user_id=${uId}`

            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                const dbItems: CartItem[] = data.items || []

                if (dbItems.length > 0) {
                    setItems(prev => {
                        // Merge logic: Combine local and DB items
                        const merged = [...prev]
                        for (const dbItem of dbItems) {
                            const dbKey = getItemKey(dbItem.productId, dbItem.variantId, dbItem.options)
                            const existingIdx = merged.findIndex(i =>
                                getItemKey(i.productId, i.variantId, i.options) === dbKey
                            )

                            if (existingIdx > -1) {
                                // If exists in both, use the larger quantity or just replace? 
                                // Let's take the DB as authoritative for quantity if it's there
                                merged[existingIdx] = { ...merged[existingIdx], quantity: dbItem.quantity }
                            } else {
                                merged.push(dbItem)
                            }
                        }
                        return merged
                    })
                }
            }
        } catch (e) {
            console.error('[Cart Context] Initial sync failed:', e)
        }
    }

    const getItemKey = (productId: string, variantId?: string, options?: Record<string, string>) => {
        if (variantId) return `${productId}-${variantId}`
        if (options) {
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
            setIsCartOpen,
            syncWithDB
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
