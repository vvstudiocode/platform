import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductEditForm } from './product-edit-form'

interface Props {
    params: Promise<{ storeId: string; productId: string }>
}

export default async function ProductEditPage({ params }: Props) {
    const { storeId, productId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 驗證商店所有權
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('id', storeId)
        .eq('managed_by', user?.id)
        .single()

    if (!store) {
        notFound()
    }

    // 取得商品
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('tenant_id', storeId)
        .single()

    if (!product) {
        notFound()
    }

    const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)

    return (
        <ProductEditForm
            product={{
                ...product,
                images: product.images || [],
                options: product.options || [],
                variants: variants || []
            }}
            storeId={storeId}
            storeName={store.name}
            storeSlug={store.slug}
        />
    )
}
