'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { Loader2 } from 'lucide-react'

// ============================================================
// LINE Cart Hydration Page
// Bridges DB cart_items → localStorage cart → redirect to checkout
// ============================================================

export default function LineCartPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const searchParams = useSearchParams()
    const tenantId = searchParams.get('tenant_id')
    const userIdParam = searchParams.get('user_id')
    const { addItem, clearCart, setStoreSlug, items, syncWithDB } = useCart()
    const [status, setStatus] = useState('載入購物車中...')
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        setStoreSlug(slug)
    }, [slug, setStoreSlug])

    useEffect(() => {
        if (!tenantId || hydrated) return

        async function hydrateCart() {
            try {
                setStatus('正在同步您的購物車...')

                let url = `/api/cart/line?tenant_id=${tenantId}`
                if (userIdParam) url += `&user_id=${userIdParam}`

                const res = await fetch(url)
                if (!res.ok) {
                    console.error('[Cart Hydrate] API error:', res.status)
                    if (res.status === 401) {
                        setStatus('登入連結已過期，請回 LINE 重新點擊結帳按鈕')
                    } else {
                        setStatus('購物車同步失敗，正在為您跳轉...')
                    }
                    setTimeout(() => router.replace(`/store/${slug}`), 2500)
                    return
                }

                const data = await res.json()
                const dbItems = data.items || []

                // Sync and Merge logic:
                // Instead of clearCart() + for-loop, we use syncWithDB
                // which handles merging logic automatically in the context.
                await syncWithDB(tenantId!, userIdParam || undefined)

                setStatus('購物車已成功同步，正在前往結帳...')
                setHydrated(true)

                // Redirect to checkout after a brief delay
                setTimeout(() => {
                    router.replace(`/store/${slug}/checkout`)
                }, 800)

            } catch (error) {
                console.error('[Cart Hydrate] Error:', error)
                setStatus('發生錯誤，正在為您跳轉...')
                setTimeout(() => router.replace(`/store/${slug}/checkout`), 1500)
            }
        }

        hydrateCart()
    }, [tenantId, slug, hydrated, addItem, clearCart, router, setStoreSlug])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">{status}</p>
            </div>
        </div>
    )
}
