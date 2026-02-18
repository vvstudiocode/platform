import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductEditForm } from './product-edit-form'
import { updateProduct } from '../actions'

interface Props {
    params: Promise<{ productId: string }>
}

export default async function EditProductPage({ params }: Props) {
    const { productId } = await params
    const supabase = await createClient()

    // 取得商品與商店資訊
    const { data: product } = await supabase
        .from('products')
        .select('*, tenants(name, slug)')
        .eq('id', productId)
        .single()

    if (!product) {
        notFound()
    }

    const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('id')

    const boundUpdateProduct = updateProduct.bind(null, productId)

    return (
        <ProductEditForm
            product={{
                id: product.id,
                name: product.name,
                description: product.description,
                brand: product.brand,
                category: product.category,
                price: Number(product.price),
                cost: product.cost ? Number(product.cost) : null,
                stock: product.stock || 0,
                sku: product.sku,
                keyword: product.keyword,
                image_url: product.image_url,
                status: product.status as any,
                seo_title: product.seo_title,
                seo_description: product.seo_description,
                seo_keywords: product.seo_keywords,
                images: (product.images as string[]) || [],
                options: (product.options as any[]) || [],
                variants: (variants as any[]) || []
            }}
            updateAction={boundUpdateProduct}
            storeSlug={product.tenants?.slug}
        />
    )
}
