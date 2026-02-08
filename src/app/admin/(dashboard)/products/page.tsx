import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductsPage } from '@/features/products/products-page'
import { deleteProduct, updateProductStatus, updateProductOrder } from './actions'

// 取得或建立總部商店
async function getOrCreateHQStore(supabase: any, userId: string) {
    const { data: existing } = await supabase
        .from('tenants')
        .select('id')
        .eq('managed_by', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    if (existing) return existing.id

    const { data: newStore, error } = await supabase
        .from('tenants')
        .insert({
            name: '總部商店',
            slug: 'hq-' + Date.now(),
            managed_by: userId,
            description: '總部官方商店',
        })
        .select('id')
        .single()

    if (error) {
        console.error('建立總部商店失敗:', error)
        return null
    }

    return newStore?.id
}

export default async function AdminProductsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const hqStoreId = await getOrCreateHQStore(supabase, user.id)

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', hqStoreId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

    return (
        <ProductsPage
            products={products?.map(p => ({
                id: p.id,
                sku: p.sku,
                name: p.name,
                brand: p.brand,
                category: p.category,
                price: p.price,
                cost: p.cost || 0,
                stock: p.stock || 0,
                image_url: p.image_url,
                status: (p.status as 'active' | 'draft' | 'archived') || 'draft',
                sort_order: p.sort_order || 0
            })) || []}
            basePath="/admin/products"
            deleteAction={deleteProduct}
            updateStatusAction={updateProductStatus}
            updateOrderAction={updateProductOrder}
        />
    )
}
