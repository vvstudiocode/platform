'use client'

import { useState } from 'react'
import { updateOrderStatus } from '../actions'

interface Props {
    orderId: string
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

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)

    const handleChange = async (newStatus: string) => {
        setLoading(true)
        setStatus(newStatus)
        await updateOrderStatus(orderId, newStatus)
        setLoading(false)
    }

    return (
        <select
            value={status}
            onChange={(e) => handleChange(e.target.value)}
            disabled={loading}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
            {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    )
}
