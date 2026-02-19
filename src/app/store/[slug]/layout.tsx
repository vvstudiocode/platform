import { CartProvider } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsTracker } from '@/components/analytics-tracker'
import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { CartHydrator } from './components/cart-hydrator'

// --- GSC Verification via generateMetadata ---
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()

    const { data: store } = await supabase
        .from('tenants')
        .select('settings')
        .eq('slug', slug)
        .single()

    const settings = (store?.settings as Record<string, any>) || {}
    const gscCode = settings.analytics?.gsc_verification_code

    return {
        ...(gscCode ? {
            verification: {
                google: gscCode,
            }
        } : {}),
    }
}

// --- Store Layout ---
export default async function StoreLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const supabase = await createClient()

    // Resolve Slug to Tenant ID & Settings for Analytics
    const { data: store } = await supabase
        .from('tenants')
        .select('id, settings')
        .eq('slug', slug)
        .single()

    const settings = (store?.settings as Record<string, any>) || {}
    const ga4Id = settings.analytics?.ga4_measurement_id

    return (
        <CartProvider>
            {store && <AnalyticsTracker tenantId={store.id} />}
            {ga4Id && <GoogleAnalytics gaId={ga4Id} />}
            {children}
        </CartProvider>
    )
}
