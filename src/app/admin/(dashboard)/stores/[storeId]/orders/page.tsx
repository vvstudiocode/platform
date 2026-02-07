import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, ClipboardList, Clock, CheckCircle, Truck, XCircle, DollarSign, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrderTable } from '@/components/admin/order-table'
import { OrderFormModal } from '@/components/admin/order-form-modal'

interface Props {
    params: Promise<{ storeId: string }>
    searchParams: Promise<{ status?: string }>
}

export default async function StoreOrdersPage({ params, searchParams }: Props) {
    const { storeId } = await params
    const { status } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 驗證商店所有權
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('id', storeId)
        .eq('managed_by', user?.id || '')
        .single()

    if (!store) {
        notFound()
    }

    // 取得訂單
    let query = supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', storeId)
        .order('created_at', { ascending: false })

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    const { data: orders } = await query

    // 取得商品列表供新增訂單使用
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .eq('tenant_id', storeId)
        .order('name')

    const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
        pending: { icon: Clock, label: '待付款', color: 'text-amber-400 bg-amber-500/20' },
        paid: { icon: DollarSign, label: '已付款', color: 'text-emerald-400 bg-emerald-500/20' },
        processing: { icon: Package, label: '處理中', color: 'text-blue-400 bg-blue-500/20' },
        shipped: { icon: Truck, label: '已出貨', color: 'text-purple-400 bg-purple-500/20' },
        completed: { icon: CheckCircle, label: '已完成', color: 'text-green-400 bg-green-500/20' },
        cancelled: { icon: XCircle, label: '已取消', color: 'text-red-400 bg-red-500/20' },
    }

    const statusFilters = [
        { value: 'all', label: '全部' },
        { value: 'pending', label: '待付款' },
        { value: 'paid', label: '已付款' },
        { value: 'processing', label: '處理中' },
        { value: 'shipped', label: '已出貨' },
        { value: 'completed', label: '已完成' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href={`/admin/stores/${storeId}`}
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        返回 {store.name}
                    </Link>
                    <h1 className="text-2xl font-bold text-white">訂單管理</h1>
                    <p className="text-zinc-400 text-sm mt-1">共 {orders?.length || 0} 筆訂單</p>
                </div>
                <OrderFormModal
                    storeId={storeId}
                    storeSlug={store.slug}
                    products={products?.map(p => ({ ...p, stock: p.stock || 0 })) || []}
                />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                    <Link
                        key={filter.value}
                        href={`/admin/stores/${storeId}/orders${filter.value === 'all' ? '' : `?status=${filter.value}`}`}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className={`border-zinc-700 ${(status === filter.value || (!status && filter.value === 'all'))
                                ? 'bg-white text-black hover:bg-white'
                                : 'text-zinc-300 hover:text-white'
                                }`}
                        >
                            {filter.label}
                        </Button>
                    </Link>
                ))}
            </div>

            {orders && orders.length > 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                    <OrderTable
                        orders={(orders as any[]) || []}
                        products={products?.map(p => ({ ...p, stock: p.stock || 0 })) || []}
                        storeId={storeId}
                        isHQ={false}
                    />
                </div>
            ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <ClipboardList className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">尚未有任何訂單</h3>
                    <p className="text-zinc-400 mt-1">當客戶下單後，訂單會顯示在這裡</p>
                </div>
            )}
        </div>
    )
}
