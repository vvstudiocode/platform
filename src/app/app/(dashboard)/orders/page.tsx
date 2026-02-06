import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { OrderTable } from '@/components/admin/order-table'
import { OrderFormModal } from '@/components/admin/order-form-modal'

async function getUserStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id, tenants:tenant_id(slug)')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return { storeId: data?.tenant_id, storeSlug: data?.tenants?.slug }
}

export default async function AppOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const { status: statusFilter } = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/app/login')

    const { storeId, storeSlug } = await getUserStoreId(supabase, user.id)
    if (!storeId) redirect('/app/onboarding')

    let query = supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', storeId)
        .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    const { data: orders } = await query

    const filters = [
        { value: 'all', label: '全部' },
        { value: 'pending', label: '待付款' },
        { value: 'paid', label: '已付款' },
        { value: 'processing', label: '處理中' },
        { value: 'shipped', label: '已出貨' },
        { value: 'completed', label: '已完成' },
    ]

    // Fetch products for order form modal
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .eq('tenant_id', storeId)
        .order('name')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">訂單管理</h1>
                <OrderFormModal
                    storeId={storeId}
                    storeSlug={storeSlug || 'store'}
                    products={products || []}
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map((filter) => (
                    <Link
                        key={filter.value}
                        href={`/app/orders${filter.value === 'all' ? '' : `?status=${filter.value}`}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${(statusFilter || 'all') === filter.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                    >
                        {filter.label}
                    </Link>
                ))}
            </div>

            <OrderTable
                orders={orders || []}
                products={products || []}
                storeId={storeId}
                isHQ={false}
            />
        </div>
    )
}
