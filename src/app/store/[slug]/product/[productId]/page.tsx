import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './product-detail-client'

interface Props {
    params: Promise<{ slug: string; productId: string }>
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug, productId } = await params
    const supabase = await createClient()

    // 取得商店
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('slug', slug)
        .single()

    if (!store) {
        notFound()
    }

    // 取得商品
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('tenant_id', store.id)
        .eq('status', 'active')
        .single()

    if (!product) {
        notFound()
    }

    return (
        <ProductDetailClient
            store={{ name: store.name, slug: store.slug }}
            product={{
                id: product.id,
                name: product.name,
                description: product.description,
                price: Number(product.price),
                stock: product.stock,
                image_url: product.image_url,
                images: (product.images as string[]) || [],
                brand: product.brand,
                options: (product.options as Record<string, string[]>) || {},
                variants: (product.variants as any[]) || [],
            }}
        />
    )
}
