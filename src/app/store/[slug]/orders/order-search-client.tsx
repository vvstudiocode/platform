'use client'

import { useState } from 'react'
import { Search, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
    store: {
        name: string
        slug: string
    }
}

interface Order {
    id: string
    order_number: string
    status: string
    total: number
    items: Array<{ name: string; quantity: number }>
    created_at: string
}

const statusLabels: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    processing: '處理中',
    shipped: '已出貨',
    completed: '已完成',
    cancelled: '已取消',
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-emerald-100 text-emerald-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
}

export function OrderSearchClient({ store }: Props) {
    const [phone, setPhone] = useState('')
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [error, setError] = useState('')

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!phone.trim()) return

        setLoading(true)
        setError('')
        setSearched(true)

        try {
            const response = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}&store=${store.slug}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || '查詢失敗')
            }

            setOrders(data.orders)
        } catch (err: any) {
            setError(err.message)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <Link
                        href={`/store/${store.slug}`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">{store.name}</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">訂單查詢</h1>
                <p className="text-gray-500 mb-6">輸入您的電話號碼查詢訂單</p>

                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="請輸入電話號碼"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50"
                        >
                            {loading ? '查詢中...' : '查詢'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                {searched && orders.length === 0 && !loading && !error && (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">找不到相關訂單</p>
                    </div>
                )}

                {orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-mono font-bold text-gray-900">
                                            {order.order_number}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('zh-TW', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {statusLabels[order.status] || order.status}
                                    </span>
                                </div>
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        {order.items.map(item => `${item.name} × ${item.quantity}`).join('、')}
                                    </p>
                                    <p className="font-bold text-rose-500">
                                        NT$ {Number(order.total).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
