'use client'

import { useState } from 'react'
import { updateOrderStatus } from './actions'

interface Props {
    orderId: string
    storeId: string
    currentStatus: string
}

const statusOptions = [
    { value: 'pending', label: '待付款' },
    { value: 'paid', label: '已付款' },
    { value: 'processing', label: '處理中' },
    { value: 'shipped', label: '已出貨' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
]

export function OrderStatusSelect({ orderId, storeId, currentStatus }: Props) {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)

    const handleChange = async (newStatus: string) => {
        if (newStatus === status) return

        setLoading(true)
        try {
            await updateOrderStatus(storeId, orderId, newStatus)
            setStatus(newStatus)
        } catch (error) {
            console.error('Failed to update status:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <select
            value={status}
            onChange={(e) => handleChange(e.target.value)}
            disabled={loading}
            className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm disabled:opacity-50"
        >
            {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    )
}
