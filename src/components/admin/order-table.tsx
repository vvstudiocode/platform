'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowRight,
    ChevronDown,
    ChevronRight,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    DollarSign,
    Package,
    MoreHorizontal,
    Trash2,
    Edit,
    ChevronUp,
    Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { OrderFormModal } from './order-form-modal'
import { OrderStatusEditable } from './order-status-editable'

interface Order {
    id: string
    order_number: string
    customer_name: string
    customer_phone: string
    customer_email?: string
    total: number
    status: string
    created_at: string
    items: any[]
    notes?: string
    shipping_method?: string
    shipping_fee?: number
    store_name?: string
    store_code?: string
    store_address?: string
    tenant_id?: string // Added for HQ view fallback
}

interface Product {
    id: string
    name: string
    price: number
    stock: number
    images?: string[]
}

interface Props {
    orders: Order[]
    products: Product[] // Added
    storeId?: string // If provided, logic adapts for sub-site
    isHQ?: boolean   // If true, logic adapts for HQ
    settings?: any   // Added
}

const statusConfig: Record<string, { icon: any; label: string; color: string; badge: string }> = {
    pending: { icon: Clock, label: '待付款', color: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border border-amber-100' },
    paid: { icon: DollarSign, label: '已付款', color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
    processing: { icon: Package, label: '處理中', color: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 border border-blue-100' },
    shipped: { icon: Truck, label: '已出貨', color: 'text-purple-600', badge: 'bg-purple-50 text-purple-700 border border-purple-100' },
    completed: { icon: CheckCircle, label: '已完成', color: 'text-green-600', badge: 'bg-green-50 text-green-700 border border-green-100' },
    cancelled: { icon: XCircle, label: '已取消', color: 'text-red-600', badge: 'bg-red-50 text-red-700 border border-red-100' },
}

import { deleteOrder } from '@/app/admin/(dashboard)/orders/actions'

export function OrderTable({ orders, products, storeId, isHQ, settings }: Props) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const router = useRouter()

    // Create a map for O(1) product lookup to improve performance
    const productMap = new Map(products.map(p => [p.id, p]))

    const toggleRow = (orderId: string) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId)
        } else {
            newExpanded.add(orderId)
        }
        setExpandedRows(newExpanded)
    }

    const handleDelete = async (orderId: string) => {
        if (!confirm('確定要刪除此訂單嗎？此動作無法復原。')) return

        try {
            const res = await deleteOrder(storeId || null, orderId, isHQ)
            if (res.error) {
                alert(res.error)
            } else {
                router.refresh()
            }
        } catch (error) {
            console.error('Delete error', error)
            alert('刪除失敗')
        }
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-muted/30">
                        <tr className="text-left border-b border-border">
                            <th className="px-6 py-4 text-xs font-serif font-semibold text-muted-foreground w-[180px]">訂單編號 / 時間</th>
                            <th className="px-6 py-4 text-xs font-serif font-semibold text-muted-foreground w-[180px]">客戶</th>
                            <th className="px-6 py-4 text-xs font-serif font-semibold text-muted-foreground">內容</th>
                            <th className="px-6 py-4 text-xs font-serif font-semibold text-muted-foreground w-[120px]">總金額</th>
                            <th className="px-6 py-4 text-xs font-serif font-semibold text-muted-foreground w-[120px]">狀態</th>
                            <th className="px-6 py-4 text-xs font-serif font-semibold text-muted-foreground text-right w-[100px]">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>目前沒有訂單</p>
                                </td>
                            </tr>
                        ) : orders.map((order) => {
                            const config = statusConfig[order.status] || statusConfig.pending
                            const isExpanded = expandedRows.has(order.id)
                            const items = order.items || []
                            const itemCount = items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)
                            const displayItems = items.slice(0, 3)

                            return (
                                <Fragment key={order.id}>
                                    <tr
                                        className={`group transition-all cursor-pointer ${isExpanded ? 'bg-muted/30' : 'hover:bg-accent/5'}`}
                                        onClick={() => toggleRow(order.id)}
                                    >
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-sm text-foreground group-hover:text-accent transition-colors">
                                                    #{order.order_number}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString('zh-TW', {
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-foreground">{order.customer_name}</span>
                                                <span className="text-xs text-muted-foreground">{order.customer_phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-3 overflow-hidden">
                                                    {displayItems.map((item: any, idx: number) => {
                                                        const product = productMap.get(item.product_id)
                                                        const imageUrl = product?.images?.[0]

                                                        return (
                                                            <div key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-card bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                                                {imageUrl ? (
                                                                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                                                                        <Package className="h-3 w-3 text-accent" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                    {items.length > 3 && (
                                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-card bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0">
                                                            +{items.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-foreground line-clamp-1">
                                                        {displayItems[0]?.name}
                                                        {items.length > 1 && ` 等 ${items.length} 項`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className="text-sm font-bold text-foreground">
                                                NT$ {Number(order.total).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                                            <div className="inline-flex">
                                                <Badge className={`${config.badge} border shadow-sm font-normal px-2.5 py-0.5`}>
                                                    {config.label}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right align-top">
                                            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                                                詳情
                                            </span>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-muted/30">
                                            <td colSpan={6} className="px-6 pb-6 pt-0 border-b border-border">
                                                <div className="pl-0 md:pl-0 grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {/* Left Column: Order Items */}
                                                    <div>
                                                        <h4 className="text-sm font-serif font-medium text-foreground mb-4 flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                            訂單內容
                                                        </h4>
                                                        <div className="bg-card rounded-lg border border-border p-4 shadow-sm space-y-4">
                                                            {(order.items || []).map((item: any, idx: number) => {
                                                                const product = productMap.get(item.product_id)
                                                                const imageUrl = product?.images?.[0]
                                                                return (
                                                                    <div key={idx} className="flex justify-between items-start text-sm">
                                                                        <div className="flex gap-3">
                                                                            <div className="w-12 h-12 bg-muted rounded-md shrink-0 border border-border overflow-hidden">
                                                                                {imageUrl ? (
                                                                                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <div className="w-full h-full bg-accent/5 flex items-center justify-center">
                                                                                        <Package className="h-5 w-5 text-muted-foreground/30" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-foreground font-medium">{item.name}</p>
                                                                                {item.options && Object.keys(item.options).length > 0 && (
                                                                                    <p className="text-muted-foreground text-xs mt-0.5">
                                                                                        {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-foreground">x{item.quantity}</p>
                                                                            <p className="text-muted-foreground text-xs">NT$ {Number(item.price).toLocaleString()}</p>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}

                                                            <div className="border-t border-border pt-3 mt-3 space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">小計</span>
                                                                    <span className="text-foreground">NT$ {Number(order.total - (order.shipping_fee || 0)).toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">運費 ({order.shipping_method})</span>
                                                                    <span className="text-foreground">NT$ {Number(order.shipping_fee || 0).toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm font-medium pt-2 border-t border-border border-dashed">
                                                                    <span className="text-foreground">總計</span>
                                                                    <span className="text-accent text-lg font-serif">NT$ {Number(order.total).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Column: Customer & Delivery Info */}
                                                    <div className="space-y-6">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h4 className="text-sm font-serif font-medium text-foreground flex items-center gap-2">
                                                                    <Truck className="h-4 w-4 text-muted-foreground" />
                                                                    配送資訊
                                                                </h4>
                                                                <div className="flex gap-2">
                                                                    <OrderFormModal
                                                                        storeId={storeId || order.tenant_id || ''}
                                                                        storeSlug={isHQ ? 'hq' : 'store'}
                                                                        products={products}
                                                                        order={order}
                                                                        settings={settings}
                                                                        trigger={
                                                                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                                                                                <Edit className="h-3.5 w-3.5" />
                                                                                編輯
                                                                            </Button>
                                                                        }
                                                                    />
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDelete(order.id);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                        刪除
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="bg-card p-4 rounded-lg border border-border space-y-3 text-sm shadow-sm relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-3 opacity-5">
                                                                    <Truck className="h-24 w-24" />
                                                                </div>
                                                                <div className="flex justify-between relative z-10">
                                                                    <span className="text-muted-foreground">收件人</span>
                                                                    <span className="text-foreground font-medium">{order.customer_name}</span>
                                                                </div>
                                                                <div className="flex justify-between relative z-10">
                                                                    <span className="text-muted-foreground">電話</span>
                                                                    <span className="text-foreground">{order.customer_phone}</span>
                                                                </div>
                                                                {order.customer_email && (
                                                                    <div className="flex justify-between relative z-10">
                                                                        <span className="text-muted-foreground">Email</span>
                                                                        <span className="text-foreground text-right">{order.customer_email}</span>
                                                                    </div>
                                                                )}
                                                                <div className="border-t border-border my-2 relative z-10"></div>
                                                                {order.shipping_method === 'home' ? (
                                                                    <div className="flex justify-between relative z-10">
                                                                        <span className="text-muted-foreground">地址</span>
                                                                        <span className="text-foreground text-right max-w-[200px]">{order.store_address || '未提供'}</span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex justify-between relative z-10">
                                                                            <span className="text-muted-foreground">門市名稱</span>
                                                                            <span className="text-foreground">{order.store_name}</span>
                                                                        </div>
                                                                        <div className="flex justify-between relative z-10">
                                                                            <span className="text-muted-foreground">門市代號</span>
                                                                            <span className="text-foreground">{order.store_code}</span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {order.notes && (
                                                            <div>
                                                                <h4 className="text-sm font-medium text-foreground mb-2">備註</h4>
                                                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                                                                    {order.notes}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
