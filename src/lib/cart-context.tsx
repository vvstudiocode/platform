'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react'

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
    syncWithDB: (tenantId: string, userId?: string, traceId?: string) => Promise<void>
    hasSynced: boolean
    isHydrated: boolean
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
    const [hasSynced, setHasSynced] = useState(false)
    const isSyncingRef = useRef(false)
    const syncPromiseRef = useRef<Promise<void> | null>(null)
    const pendingSyncRef = useRef<{ tenantId: string; userId?: string; traceId?: string } | null>(null)
    const activeStoreSlugRef = useRef<string | null>(null)

    // 1. Initial Load from localStorage
    useEffect(() => {
        if (!storeSlug) return
        activeStoreSlugRef.current = storeSlug

        const stored = localStorage.getItem(getCartStorageKey(storeSlug))
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                const storedItems = parsed.items || []
                setItems(prev => {
                    // If items already exist, it means syncWithDB might have finished first.
                    // We only load from local if current state is empty.
                    // This is a safety measure, but usually hydration happens first.
                    return prev.length === 0 ? storedItems : prev
                })
            } catch (e) {
                console.error('Failed to parse cart:', e)
                setItems([])
            }
        } else {
            setItems([])
        }
        setIsHydrated(true)
        // Reset hasSynced when switching stores
        setHasSynced(false)
    }, [storeSlug])

    // 2. Sync to localStorage when items change
    useEffect(() => {
        if (isHydrated && storeSlug) {
            localStorage.setItem(getCartStorageKey(storeSlug), JSON.stringify({ items }))
        }
    }, [items, storeSlug, isHydrated])

    // 3. Background Sync to DB (Debounced)
    useEffect(() => {
        // Guard: Only sync to DB if we are hydrated FROM local AND we have synced WITH DB at least once
        // This prevents an empty local cart from wiping the DB cart before they are merged
        if (!isHydrated || !hasSynced || !tenantId || !storeSlug) return

        const syncTimer = setTimeout(async () => {
            const traceId = `bg-${Math.random().toString(36).substring(2, 9)}`
            try {
                // Only sync if we have a way to identify the user (session or userId param)
                // We'll trust the API to handle the auth check
                let url = `/api/cart/sync?tenant_id=${tenantId}&trace_id=${traceId}`
                if (userId) url += `&user_id=${userId}`

                console.log(`[Cart Sync] [${traceId}] Background sync starting (mode: replace, items: ${items.length})`)
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items, mode: 'replace' })
                })
                if (!res.ok) throw new Error(`Sync failed with status ${res.status}`)
                console.log(`[Cart Sync] [${traceId}] Background sync success`)
            } catch (e) {
                console.warn(`[Cart Sync] [${traceId}] Background sync failed:`, e)
            }
        }, 1500) // 1.5s debounce

        return () => clearTimeout(syncTimer)
    }, [items, tenantId, userId, isHydrated, storeSlug, hasSynced])

    const setStoreSlug = useCallback((slug: string) => {
        if (slug !== storeSlug) {
            setIsHydrated(false)
            setStoreSlugState(slug)
            activeStoreSlugRef.current = slug // Update sync ref immediately
        }
    }, [storeSlug])

    const getItemKey = useCallback((productId: string, variantId?: string, options?: Record<string, string>) => {
        if (variantId) return `${productId}-${variantId}`
        if (options) {
            const optionsKey = Object.entries(options)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => `${k}:${v}`)
                .join('|')
            return `${productId}-${optionsKey}`
        }
        return productId
    }, [])


    const syncWithDB = useCallback(async (tId: string, uId?: string, traceIdParam?: string) => {
        const currentTraceId = traceIdParam || `sync-${Math.random().toString(36).substring(2, 9)}`

        if (isSyncingRef.current) {
            console.log(`[Cart Sync] [${currentTraceId}] Sync already in progress, queuing...`)
            pendingSyncRef.current = { tenantId: tId, userId: uId, traceId: currentTraceId }
            return syncPromiseRef.current || Promise.resolve()
        }

        isSyncingRef.current = true

        const performSync = async () => {
            try {
                let nextSync: { tenantId: string; userId?: string; traceId?: string } | null = { tenantId: tId, userId: uId, traceId: currentTraceId }

                while (nextSync) {
                    const currentSync = nextSync
                    const syncTraceId = currentSync.traceId || currentTraceId
                    nextSync = null

                    setTenantId(currentSync.tenantId)
                    setUserId(currentSync.userId ?? null)

                    const syncStoreSlug = activeStoreSlugRef.current
                    let url = `/api/cart/line?tenant_id=${currentSync.tenantId}&trace_id=${syncTraceId}`
                    if (currentSync.userId) url += `&user_id=${currentSync.userId}`

                    console.log(`[Cart Sync] [${syncTraceId}] Fetching DB cart items...`)
                    const res = await fetch(url)
                    if (res.ok) {
                        const data = await res.json()
                        const dbItems: CartItem[] = data.items || []
                        console.log(`[Cart Sync] [${syncTraceId}] Fetched ${dbItems.length} items from DB`)

                        // Ignore stale response if user switched stores while the request was in flight.
                        if (syncStoreSlug !== activeStoreSlugRef.current) {
                            console.log(`[Cart Sync] [${syncTraceId}] Store slug changed, ignoring stale response`)
                            continue
                        }

                        setItems(prev => {
                            const merged = [...prev]
                            for (const dbItem of dbItems) {
                                const dbKey = getItemKey(dbItem.productId, dbItem.variantId, dbItem.options)
                                const existingIdx = merged.findIndex(i =>
                                    getItemKey(i.productId, i.variantId, i.options) === dbKey
                                )

                                if (existingIdx > -1) {
                                    merged[existingIdx] = { ...merged[existingIdx], quantity: dbItem.quantity }
                                } else {
                                    merged.push(dbItem)
                                }
                            }
                            console.log(`[Cart Sync] [${syncTraceId}] Merged items. Final count: ${merged.length}`)
                            return merged
                        })

                        setHasSynced(true)
                    } else {
                        console.error(`[Cart Sync] [${syncTraceId}] Failed to fetch DB cart: ${res.status}`)
                    }

                    if (pendingSyncRef.current) {
                        nextSync = pendingSyncRef.current
                        pendingSyncRef.current = null
                    }
                }
            } catch (e) {
                console.error(`[Cart Sync] [${currentTraceId}] Sync failed:`, e)
            } finally {
                isSyncingRef.current = false
                syncPromiseRef.current = null
            }
        }

        syncPromiseRef.current = performSync()
        return syncPromiseRef.current
    }, [getItemKey, storeSlug])

    const addItem = useCallback((newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
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
    }, [getItemKey])

    const removeItem = useCallback((productId: string, variantId?: string, options?: Record<string, string>) => {
        setItems(prev => prev.filter(item =>
            getItemKey(item.productId, item.variantId, item.options) !== getItemKey(productId, variantId, options)
        ))
    }, [getItemKey])

    const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string, options?: Record<string, string>) => {
        setItems(prev => prev.map(item => {
            if (getItemKey(item.productId, item.variantId, item.options) === getItemKey(productId, variantId, options)) {
                return { ...item, quantity: Math.min(Math.max(0, quantity), item.maxStock) }
            }
            return item
        }).filter(item => item.quantity > 0))
    }, [getItemKey])

    const clearCart = useCallback(() => {
        setItems([])

        // Proactively clear DB if we have the context
        if (tenantId) {
            const traceId = `clear-${Math.random().toString(36).substring(2, 9)}`
            let url = `/api/cart/sync?tenant_id=${tenantId}&trace_id=${traceId}`
            if (userId) url += `&user_id=${userId}`

            console.log(`[Cart Sync] [${traceId}] Proactively clearing DB cart`)
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [], mode: 'replace' })
            }).catch(e => console.warn(`[Cart Sync] [${traceId}] Proactive clear failed:`, e))
        }
    }, [tenantId, userId])


    const getItemCount = useCallback(() => {
        return items.reduce((sum, item) => sum + item.quantity, 0)
    }, [items])

    const getCartTotal = useCallback(() => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }, [items])

    const contextValue = useMemo(() => ({
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
        syncWithDB,
        hasSynced,
        isHydrated
    }), [
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
        syncWithDB,
        hasSynced,
        isHydrated
    ])

    return (
        <CartContext.Provider value={contextValue}>
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
