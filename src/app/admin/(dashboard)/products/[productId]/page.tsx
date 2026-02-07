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
    const { data: user } = await supabase.auth.getUser()

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('managed_by', user?.user?.id || '')
        .single()

    if (!product) {
        notFound()
    }

    const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)

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
                price_krw: product.price_krw,
                stock: product.stock || 0,
                sku: product.sku,
                image_url: product.image_url,
                status: product.status || 'active',
                images: (product.images as any) || [],
                options: (product.options as any) || [],
                variants: (variants as any[])?.map(v => ({
                    ...v,
                    stock: v.stock || 0,
                    options: v.options || {}
                })) || []
            }}
            updateAction={boundUpdateProduct}
        />
    )
}
