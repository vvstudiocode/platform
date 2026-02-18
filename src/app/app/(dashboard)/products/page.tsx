import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductsPage } from '@/features/products/products-page'
import { deleteProduct, updateProductStatus, updateProductOrder } from './actions'

async function getUserStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return data?.tenant_id
}

export default async function AppProductsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/app/login')

    const storeId = await getUserStoreId(supabase, user.id)
    if (!storeId) redirect('/app/onboarding')

    const [{ data: products }, { data: tenant }] = await Promise.all([
        supabase
            .from('products')
            .select('*')
            .eq('tenant_id', storeId)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false }),
        supabase
            .from('tenants')
            .select('settings')
            .eq('id', storeId)
            .single()
    ])

    const lineBasicId = (tenant?.settings as any)?.line?.line_id || null

    return (
        <ProductsPage
            products={products?.map(p => ({
                id: p.id,
                sku: p.sku,
                keyword: p.keyword,
                name: p.name,
                description: p.description,
                brand: p.brand,
                category: p.category,
                price: p.price,
                cost: p.cost || 0,
                stock: p.stock || 0,
                image_url: p.image_url,
                status: (p.status as 'active' | 'draft' | 'archived') || 'draft',
                sort_order: p.sort_order || 0
            })) || []}
            lineBasicId={lineBasicId}
            basePath="/app/products"
            deleteAction={deleteProduct}
            updateStatusAction={updateProductStatus}
            updateOrderAction={updateProductOrder}
        />
    )
}
