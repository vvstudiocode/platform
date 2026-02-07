import Link from 'next/link'
import { SearchInput } from '@/components/ui/search-input'
import { OrderTable } from '@/components/admin/order-table'
import { OrderFormModal } from '@/components/admin/order-form-modal'
import { TenantSettings } from '@/lib/tenant'

interface OrderListPageProps {
    orders: any[]
    products: any[]
    storeId: string
    storeSlug?: string // Optional, for App side mainly
    isHQ: boolean
    settings: TenantSettings
    statusFilter?: string
    searchQuery?: string
    baseUrl: string // '/admin/orders' or '/app/orders'
}

export function OrderListPage({
    orders,
    products,
    storeId,
    storeSlug,
    isHQ,
    settings,
    statusFilter,
    searchQuery,
    baseUrl
}: OrderListPageProps) {
    const filters = [
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
                <SearchInput placeholder="搜尋訂單編號、客戶名稱..." className="w-full max-w-sm" />
                <OrderFormModal
                    storeId={storeId}
                    storeSlug={storeSlug || 'store'}
                    products={products}
                    settings={settings}
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map((filter) => (
                    <Link
                        key={filter.value}
                        href={`${baseUrl}?${new URLSearchParams({
                            ...(statusFilter ? { status: statusFilter } : {}),
                            ...(searchQuery ? { q: searchQuery } : {}),
                            status: filter.value
                        }).toString()}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${(statusFilter || 'all') === filter.value
                            ? 'bg-accent text-accent-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        {filter.label}
                    </Link>
                ))}
            </div>

            <OrderTable
                orders={orders}
                products={products}
                storeId={storeId} // Only needed for some actions in table?
                isHQ={isHQ}
                settings={settings}
            />
        </div>
    )
}
