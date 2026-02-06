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
}

interface Props {
    orders: Order[]
    products: Product[] // Added
    storeId?: string // If provided, logic adapts for sub-site
    isHQ?: boolean   // If true, logic adapts for HQ
}

const statusConfig: Record<string, { icon: any; label: string; color: string; badge: string }> = {
    pending: { icon: Clock, label: '待付款', color: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    paid: { icon: DollarSign, label: '已付款', color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    processing: { icon: Package, label: '處理中', color: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    shipped: { icon: Truck, label: '已出貨', color: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    completed: { icon: CheckCircle, label: '已完成', color: 'text-green-400', badge: 'bg-green-500/10 text-green-500 border-green-500/20' },
    cancelled: { icon: XCircle, label: '已取消', color: 'text-red-400', badge: 'bg-red-500/10 text-red-500 border-red-500/20' },
}

import { deleteOrder } from '@/app/admin/(dashboard)/orders/actions'

export function OrderTable({ orders, products, storeId, isHQ }: Props) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const router = useRouter()

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
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-zinc-800/50">
                        <tr className="text-left border-b border-zinc-800">
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-10"></th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">訂單編號</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">客戶資訊</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">金額</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">狀態</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">建立時間</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                    <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>目前沒有訂單</p>
                                </td>
                            </tr>
                        ) : orders.map((order) => {
                            const config = statusConfig[order.status] || statusConfig.pending
                            const StatusIcon = config.icon
                            const isExpanded = expandedRows.has(order.id)

                            return (
                                <Fragment key={order.id}>
                                    <tr
                                        className={`group transition-colors cursor-pointer ${isExpanded ? 'bg-zinc-800/30' : 'hover:bg-zinc-800/30'}`}
                                        onClick={() => toggleRow(order.id)}
                                    >
                                        <td className="px-3 md:px-6 py-4">
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-zinc-400 hidden md:block" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 hidden md:block" />
                                            )}
                                        </td>
                                        <td className="px-3 md:px-6 py-4">
                                            <span className="font-mono text-xs md:text-sm font-medium text-zinc-200">
                                                #{order.order_number}
                                            </span>
                                        </td>
                                        <td className="px-3 md:px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs md:text-sm font-medium text-zinc-200">{order.customer_name}</span>
                                                <span className="text-[10px] md:text-xs text-zinc-500">{order.customer_phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-4">
                                            <span className="text-xs md:text-sm font-medium text-zinc-200">
                                                NT$ {Number(order.total).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`${config.badge} flex w-fit items-center gap-1.5`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {config.label}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-zinc-500">
                                                {new Date(order.created_at).toLocaleDateString('zh-TW')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end items-center gap-2">
                                                {/* Edit Button Wrapped in Modal */}
                                                <OrderFormModal
                                                    storeId={storeId || order.tenant_id || ''} // Fallback to order tenant_id if storeId missing (e.g. HQ view)
                                                    storeSlug={isHQ ? 'hq' : 'store'} // Slug is mainly for creating new order via API. For edit, action uses ID.
                                                    products={products}
                                                    order={order}
                                                    trigger={
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-blue-500">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-500 hover:text-red-500"
                                                    onClick={() => handleDelete(order.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-zinc-800/30">
                                            <td colSpan={7} className="px-6 pb-6 pt-0">
                                                <div className="pl-14 grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-t border-zinc-700/50">
                                                    {/* Left Column: Order Items */}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-zinc-500" />
                                                            訂單內容
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {(order.items || []).map((item: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-start text-sm">
                                                                    <div className="flex gap-3">
                                                                        <div className="w-12 h-12 bg-zinc-800 rounded-md shrink-0 overflow-hidden">
                                                                            {/* Placeholder for image */}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-zinc-200 font-medium">{item.name}</p>
                                                                            {item.options && Object.keys(item.options).length > 0 && (
                                                                                <p className="text-zinc-500 text-xs mt-0.5">
                                                                                    {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-zinc-200">x{item.quantity}</p>
                                                                        <p className="text-zinc-500 text-xs">NT$ {Number(item.price).toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            <div className="border-t border-zinc-700 pt-3 mt-3 space-y-1">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-zinc-500">小計</span>
                                                                    <span className="text-zinc-200">NT$ {Number(order.total - (order.shipping_fee || 0)).toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-zinc-500">運費 ({order.shipping_method})</span>
                                                                    <span className="text-zinc-200">NT$ {Number(order.shipping_fee || 0).toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm font-medium pt-2">
                                                                    <span className="text-zinc-200">總計</span>
                                                                    <span className="text-blue-400">NT$ {Number(order.total).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Column: Customer & Delivery Info */}
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2">
                                                                <Truck className="h-4 w-4 text-zinc-500" />
                                                                配送資訊
                                                            </h4>
                                                            <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-zinc-500">收件人</span>
                                                                    <span className="text-zinc-200">{order.customer_name}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-zinc-500">電話</span>
                                                                    <span className="text-zinc-200">{order.customer_phone}</span>
                                                                </div>
                                                                {order.customer_email && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-zinc-500">Email</span>
                                                                        <span className="text-zinc-200 text-right">{order.customer_email}</span>
                                                                    </div>
                                                                )}
                                                                <div className="border-t border-zinc-700 my-2"></div>
                                                                {order.shipping_method === 'home' ? (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-zinc-500">地址</span>
                                                                        <span className="text-zinc-200 text-right">{order.store_address || '未提供'}</span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-zinc-500">門市名稱</span>
                                                                            <span className="text-zinc-200">{order.store_name}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-zinc-500">門市代號</span>
                                                                            <span className="text-zinc-200">{order.store_code}</span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {order.notes && (
                                                            <div>
                                                                <h4 className="text-sm font-medium text-zinc-200 mb-2">備註</h4>
                                                                <p className="text-sm text-zinc-500 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
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
