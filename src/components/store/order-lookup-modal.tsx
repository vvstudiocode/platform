'use client'

import { useState } from 'react'
import { X, Search, Loader2, Package, Clock } from 'lucide-react'

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

export function OrderLookupModal({ isOpen, onClose, storeSlug }: Props) {
    const [phone, setPhone] = useState('')
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [hasSearched, setHasSearched] = useState(false)

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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        訂單查詢
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="tel"
                            placeholder="請輸入手機號碼 (例如: 0912345678)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                        />
                        <button
                            type="submit"
                            disabled={loading || !phone}
                            className="px-4 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '查詢'}
                        </button>
                    </form>
                    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                            <p>查詢中...</p>
                        </div>
                    ) : hasSearched && orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <Package className="h-10 w-10 opacity-20" />
                            <p>查無訂單資料</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">#{order.order_number}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(order.created_at)}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium 
                                            ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    <div className="border-t border-dashed my-2"></div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">{order.items.length} 件商品</span>
                                        <span className="font-bold text-rose-500">NT$ {order.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
