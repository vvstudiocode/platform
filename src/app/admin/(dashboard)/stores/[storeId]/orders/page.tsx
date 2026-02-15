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
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        返回 {store.name}
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">訂單管理</h1>
                    <p className="text-muted-foreground text-sm mt-1">共 {orders?.length || 0} 筆訂單</p>
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
                            className={`border-border ${(status === filter.value || (!status && filter.value === 'all'))
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'text-muted-foreground hover:text-foreground bg-background'
                                }`}
                        >
                            {filter.label}
                        </Button>
                    </Link>
                ))}
            </div>

            {orders && orders.length > 0 ? (
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                    <OrderTable
                        orders={(orders as any[]) || []}
                        products={products?.map(p => ({ ...p, stock: p.stock || 0 })) || []}
                        storeId={storeId}
                        isHQ={false}
                    />
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <ClipboardList className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">尚未有任何訂單</h3>
                    <p className="text-muted-foreground mt-1">當客戶下單後，訂單會顯示在這裡</p>
                </div>
            )}
        </div>
    )
}

