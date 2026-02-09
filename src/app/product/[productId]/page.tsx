
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { ProductDetail } from '@/components/store/product-detail'

interface Props {
    params: Promise<{ productId: string }>
}

// 動態生成 SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { productId } = await params
    const supabase = await createClient()

    // 取得 HQ 商店 (omo)
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('slug', 'omo')
        .single()

    if (!store) return { title: '商店不存在' }

    // 取得商品
    const { data: product } = await supabase
        .from('products')
        .select('name, description, seo_title, seo_description, seo_keywords, image_url')
        .eq('id', productId)
        .eq('tenant_id', store.id)
        .eq('status', 'active')
        .single()

    if (!product) return { title: '商品不存在' }

    return {
        title: product.seo_title || `${product.name} | ${store.name}`,
        description: product.seo_description || product.description || undefined,
        keywords: product.seo_keywords || undefined,
        openGraph: {
            title: product.seo_title || product.name,
            description: product.seo_description || product.description || undefined,
            images: product.image_url ? [product.image_url] : undefined,
        },
    }
}

export default async function ProductDetailPage({ params }: Props) {
    const { productId } = await params
    const supabase = await createClient()

    // 1. 取得 HQ 商店
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('slug', 'omo')
        .single()

    if (!store) {
        notFound()
    }

    // 2. 取得商品
    const { data: product } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('id', productId)
        .eq('tenant_id', store.id)
        .eq('status', 'active')
        .single()

    if (!product) {
        notFound()
    }

    // 3. 取得導覽項目
    const { data: navItems } = await supabase
        .from('nav_items')
        .select('id, title, page_id, parent_id, position, pages(slug, is_homepage)')
        .eq('tenant_id', store.id)
        .order('position', { ascending: true })

    // 4. 取得首頁 slug
    const { data: homepage } = await supabase
        .from('pages')
        .select('slug')
        .eq('tenant_id', store.id)
        .eq('is_homepage', true)
        .eq('published', true)
        .single()

    const navMenuItems = (navItems || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.pages?.slug || '',
        is_homepage: item.pages?.is_homepage || false,
        parent_id: item.parent_id,
        position: item.position
    }))

    return (
        <ProductDetail
            store={{ name: store.name, slug: store.slug }}
            product={{
                id: product.id,
                name: product.name,
                description: product.description,
                price: Number(product.price),
                stock: product.stock || 0,
                image_url: product.image_url,
                images: (product.images as string[]) || [],
                brand: product.brand,
                options: (product.options as any[]) || [],
                variants: (product.variants as any[]) || [],
            }}
            navItems={navMenuItems}
            homeSlug={homepage?.slug}
        />
    )
}
