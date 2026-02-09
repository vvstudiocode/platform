
import { CartProvider } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsTracker } from '@/components/analytics-tracker'

export default async function ProductLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // 取得 HQ 商店 (omo)
    const { data: store } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', 'omo')
        .single()

    return (
        <CartProvider>
            {store && <AnalyticsTracker tenantId={store.id} />}
            {children}
        </CartProvider>
    )
}
