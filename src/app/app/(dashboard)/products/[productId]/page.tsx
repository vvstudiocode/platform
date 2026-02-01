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

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

    if (!product) {
        notFound()
    }

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
                stock: product.stock,
                sku: product.sku,
                image_url: product.image_url,
                status: product.status,
            }}
            updateAction={boundUpdateProduct}
        />
    )
}
