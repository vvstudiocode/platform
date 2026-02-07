import { CartProvider } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsTracker } from '@/components/analytics-tracker'

export default async function StoreLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const supabase = await createClient()

    // Resolve Slug to Tenant ID for Analytics
    const { data: store } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .single()

    return (
        <CartProvider>
            {store && <AnalyticsTracker tenantId={store.id} />}
            {children}
        </CartProvider>
    )
}
