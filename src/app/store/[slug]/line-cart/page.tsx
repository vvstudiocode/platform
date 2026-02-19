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
    const traceIdParam = searchParams.get('trace_id')
    const { setStoreSlug, syncWithDB, storeSlug } = useCart()
    const [status, setStatus] = useState('載入購物車中...')
    const [hydrated, setHydrated] = useState(false)

    const traceId = traceIdParam || `page-${Math.random().toString(36).substring(2, 9)}`

    useEffect(() => {
        if (slug) {
            console.log(`[Line Cart Page] [${traceId}] Setting store slug: ${slug}`)
            setStoreSlug(slug)
        }
    }, [slug, setStoreSlug, traceId])

    useEffect(() => {
        // Wait until storeSlug in context matches the slug from params
        // This ensures localStorage hydration for the correct store is finished
        if (!tenantId || hydrated || !slug || storeSlug !== slug) return

        async function hydrateCart() {
            try {
                console.log(`[Line Cart Page] [${traceId}] Starting hydration. tenant_id: ${tenantId}, user_id: ${userIdParam}`)
                setStatus('正在同步您的購物車...')

                // Optimized: syncWithDB handles both fetching and merging in one go
                await syncWithDB(tenantId!, userIdParam || undefined, traceId)

                console.log(`[Line Cart Page] [${traceId}] Hydration finished. Redirecting to checkout.`)
                setStatus('購物車已成功同步，正在前往結帳...')
                setHydrated(true)

                // Redirect to checkout after a brief delay
                setTimeout(() => {
                    router.replace(`/store/${slug}/checkout?trace_id=${traceId}`)
                }, 800)

            } catch (error) {
                console.error(`[Line Cart Page] [${traceId}] Error:`, error)
                setStatus('發生錯誤，正在為您跳轉...')
                setTimeout(() => router.replace(`/store/${slug}/checkout?trace_id=${traceId}`), 1500)
            }
        }

        hydrateCart()
    }, [tenantId, slug, storeSlug, hydrated, router, syncWithDB, userIdParam, traceId])


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-4" />
                <p className="text-gray-600 text-sm">{status}</p>
            </div>
        </div>
    )
}
