import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StorefrontClient } from './storefront-client'

interface Props {
    params: Promise<{ slug: string }>
}

export default async function StorefrontPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    // 取得商店資訊
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug, settings')
        .eq('slug', slug)
        .single()

    if (!store) {
        notFound()
    }

    // 取得上架商品
    const { data: products } = await supabase
        .from('products')
        .select('id, name, description, price, stock, image_url, category, brand')
        .eq('tenant_id', store.id)
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

    return (
        <StorefrontClient
            store={{
                name: store.name,
                slug: store.slug,
                settings: store.settings as any,
            }}
            products={products || []}
        />
    )
}
