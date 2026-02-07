'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Search, Loader2, Package, Clock, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'

interface Order {
    id: string
    order_number: string
    created_at: string
    total: number
    status: string
    items: any[]
}

interface Props {
    isOpen: boolean
    onClose: () => void
    storeSlug: string
}

export function OrderLookupPopover({ isOpen, onClose, storeSlug }: Props) {
    const [phone, setPhone] = useState('')
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [hasSearched, setHasSearched] = useState(false)
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    // Handle click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                // Check if the click was on the trigger button (handled in parent usually, but safe to try close)
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!phone.trim()) return

        setLoading(true)
        setError('')
        setOrders([])
        setHasSearched(false)

        try {
            // Smart handle 0 prefix
            let searchPhone = phone.trim()
            if (searchPhone.length === 9 && !searchPhone.startsWith('0')) {
                searchPhone = '0' + searchPhone
            }

            const res = await fetch(`/api/orders?phone=${searchPhone}&store=${storeSlug}`)
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || '查詢失敗')
            }

            setOrders(data.orders || [])
            setHasSearched(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'pending': '處理中',
            'paid': '已付款',
            'shipped': '已出貨',
            'completed': '已完成',
            'cancelled': '已取消'
        }
        return statusMap[status] || status
    }

    return (
        <div
            ref={ref}
            className="fixed top-20 right-4 md:right-20 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] transform transition-all duration-200 ease-out origin-top-right animate-in fade-in zoom-in-95"
        >
            {/* Triangle Arrow */}
            <div className="hidden md:block absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45" />

            {/* Header */}
            <div className="relative p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    訂單查詢
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="tel"
                        placeholder="請輸入手機號碼"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={loading || !phone}
                        className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-w-[4rem] justify-center"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '查詢'}
                    </button>
                </form>
                {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}
            </div>

            {/* Content Area */}
            <div className="max-h-[60vh] overflow-y-auto p-2 bg-gray-50/30">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                        <p className="text-xs">查詢中...</p>
                    </div>
                ) : hasSearched && orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                        <Package className="h-10 w-10 opacity-20" />
                        <p className="text-xs">查無訂單資料</p>
                    </div>
                ) : !hasSearched ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2 opacity-60">
                        <Search className="h-8 w-8 opacity-20" />
                        <p className="text-xs">輸入手機號碼以查詢歷史訂單</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900 text-sm">#{order.order_number}</p>
                                            {expandedOrderId === order.id ?
                                                <ChevronUp className="h-3 w-3 text-gray-400" /> :
                                                <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                                            }
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(order.created_at)}
                                        </div>
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ml-2
                                        ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </div>
                                <div className="border-t border-dashed border-gray-100 my-2"></div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">{order.items.length} 件商品</span>
                                    <span className="font-bold text-rose-500">NT$ {order.total.toLocaleString()}</span>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrderId === order.id && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 animate-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-1.5">
                                            {order.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-xs">
                                                    <span className="text-gray-700 truncate pr-2 flex-1">
                                                        {item.name}
                                                        {item.variant_name && <span className="text-gray-400 ml-1">({item.variant_name})</span>}
                                                        <span className="text-gray-400 ml-1">x{item.quantity}</span>
                                                    </span>
                                                    <span className="text-gray-500 tabular-nums">NT$ {item.price.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
