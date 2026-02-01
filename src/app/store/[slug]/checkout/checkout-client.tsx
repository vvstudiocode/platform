'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { ArrowLeft, Loader2, MapPin, Phone, User, MessageSquare, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Props {
    store: {
        id: string
        name: string
        slug: string
        settings?: {
            bankName?: string
            bankAccount?: string
            accountName?: string
            paymentMessage?: string
            shippingFees?: Record<string, number>
        }
    }
}

const shippingOptions = [
    { id: 'pickup', label: '面交取貨', description: '約定時間地點面交' },
    { id: '711', label: '7-11 店到店', description: '寄送至指定 7-11 門市' },
    { id: 'home', label: '宅配到府', description: '寄送至指定地址' },
]

export function CheckoutClient({ store }: Props) {
    const router = useRouter()
    const { items, getSubtotal, clearCart } = useCart()
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [orderNumber, setOrderNumber] = useState('')
    const [error, setError] = useState('')

    // Form State
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [customerEmail, setCustomerEmail] = useState('')
    const [customerLineId, setCustomerLineId] = useState('')
    const [shippingMethod, setShippingMethod] = useState('711')
    const [storeName, setStoreName] = useState('')
    const [storeCode, setStoreCode] = useState('')
    const [storeAddress, setStoreAddress] = useState('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        setMounted(true)
    }, [])

    const settings = store.settings || {}
    const shippingFees = settings.shippingFees || {
        pickup: 0,
        '711': 60,
        home: 100,
    }

    const subtotal = getSubtotal()
    const shippingFee = shippingFees[shippingMethod] || 0
    const total = subtotal + shippingFee

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeSlug: store.slug,
                    customerName,
                    customerPhone,
                    customerEmail,
                    customerLineId,
                    shippingMethod,
                    storeName: shippingMethod === '711' ? storeName : undefined,
                    storeCode: shippingMethod === '711' ? storeCode : undefined,
                    storeAddress: shippingMethod === 'home' ? storeAddress : undefined,
                    items: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        options: item.options,
                    })),
                    notes,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || '訂單建立失敗')
            }

            setOrderNumber(data.orderNumber)
            setSuccess(true)
            clearCart()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) return null

    if (items.length === 0 && !success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">購物車是空的</h1>
                    <p className="text-gray-500 mb-4">請先將商品加入購物車</p>
                    <Link
                        href={`/store/${store.slug}`}
                        className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-600"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        返回商店
                    </Link>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">訂單成功！</h1>
                    <p className="text-gray-500 mb-4">您的訂單編號</p>
                    <p className="text-3xl font-mono font-bold text-rose-500 mb-6">{orderNumber}</p>

                    {settings.bankName && (
                        <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2">匯款資訊</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p>銀行：{settings.bankName}</p>
                                <p>帳號：{settings.bankAccount}</p>
                                <p>戶名：{settings.accountName}</p>
                            </div>
                            <p className="mt-3 text-rose-500 font-medium">
                                應付金額：NT$ {total.toLocaleString()}
                            </p>
                        </div>
                    )}

                    {settings.paymentMessage && (
                        <p className="text-sm text-gray-500 mb-6">{settings.paymentMessage}</p>
                    )}

                    <Link
                        href={`/store/${store.slug}`}
                        className="inline-block w-full py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600"
                    >
                        返回商店
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <Link
                        href={`/store/${store.slug}`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">{store.name}</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">結帳</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">訂單商品</h2>
                        <div className="divide-y">
                            {items.map((item, idx) => (
                                <div key={idx} className="py-3 flex justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        {item.options && (
                                            <p className="text-sm text-gray-500">
                                                {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500">× {item.quantity}</p>
                                    </div>
                                    <p className="font-medium text-gray-900">
                                        NT$ {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">聯絡資訊</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    姓名 *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        placeholder="您的姓名"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    電話 *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        required
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        placeholder="0912345678"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Line ID
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={customerLineId}
                                        onChange={(e) => setCustomerLineId(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        placeholder="您的 Line ID"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">配送方式</h2>
                        <div className="space-y-3">
                            {shippingOptions.map((option) => (
                                <label
                                    key={option.id}
                                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${shippingMethod === option.id
                                            ? 'border-rose-500 bg-rose-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value={option.id}
                                            checked={shippingMethod === option.id}
                                            onChange={(e) => setShippingMethod(e.target.value)}
                                            className="text-rose-500"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">{option.label}</p>
                                            <p className="text-sm text-gray-500">{option.description}</p>
                                        </div>
                                    </div>
                                    <span className="font-medium text-gray-900">
                                        {shippingFees[option.id] === 0 ? '免運' : `NT$ ${shippingFees[option.id]}`}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* 7-11 Details */}
                        {shippingMethod === '711' && (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        門市名稱 *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        placeholder="例：信義門市"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        門市店號 *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={storeCode}
                                        onChange={(e) => setStoreCode(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        placeholder="例：123456"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Home Delivery Address */}
                        {shippingMethod === 'home' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    配送地址 *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <textarea
                                        required
                                        value={storeAddress}
                                        onChange={(e) => setStoreAddress(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        rows={2}
                                        placeholder="請輸入完整配送地址"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">備註</h2>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            rows={3}
                            placeholder="有什麼需要特別注意的事項嗎？"
                        />
                    </div>

                    {/* Summary */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">訂單摘要</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>商品小計</span>
                                <span>NT$ {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>運費</span>
                                <span>{shippingFee === 0 ? '免運' : `NT$ ${shippingFee}`}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>總計</span>
                                <span className="text-rose-500">NT$ {total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                處理中...
                            </>
                        ) : (
                            `確認下單 - NT$ ${total.toLocaleString()}`
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
