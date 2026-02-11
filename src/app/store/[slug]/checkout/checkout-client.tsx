'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { CheckoutOrderItems } from './components/CheckoutOrderItems'
import { CheckoutCustomerInfo } from './components/CheckoutCustomerInfo'
import { CheckoutShipping } from './components/CheckoutShipping'
import { CheckoutPayment } from './components/CheckoutPayment'
import { CheckoutSummary } from './components/CheckoutSummary'

interface Props {
    store: {
        id: string
        name: string
        slug: string
        settings?: {
            bank_name?: string
            bank_account?: string
            account_name?: string
            payment_message?: string
            shipping_pickup_fee?: number
            shipping_711_fee?: number
            shipping_home_fee?: number
            shipping_pickup_name?: string
            shipping_711_name?: string
            shipping_home_name?: string
            free_shipping_threshold?: number
            payment_methods?: {
                credit_card?: boolean
                bank_transfer?: boolean
            }
            // Legacy fallbacks
            bankName?: string
            bankAccount?: string
            accountName?: string
            paymentMessage?: string
            shippingFees?: Record<string, number>
        }
    }
}

// Removed static shippingOptions. Logic moved inside component.

export function CheckoutClient({ store }: Props) {
    const router = useRouter()
    const { items, getCartTotal, clearCart } = useCart()
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [orderNumber, setOrderNumber] = useState('')
    const [error, setError] = useState('')
    const [finalTotal, setFinalTotal] = useState(0)

    // Form State
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [customerEmail, setCustomerEmail] = useState('')
    const [customerLineId, setCustomerLineId] = useState('')
    const [shippingMethod, setShippingMethod] = useState('711')
    // State initialization helper
    const getInitialPaymentMethod = () => {
        const methods = store.settings?.payment_methods
        // Default to bank_transfer if undefined (legacy), unless explicitly false
        if (methods?.bank_transfer !== false) return 'bank_transfer'
        if (methods?.credit_card !== false) return 'credit_card'
        return 'bank_transfer' // Fallback
    }

    const [paymentMethod, setPaymentMethod] = useState(getInitialPaymentMethod())
    const [storeName, setStoreName] = useState('')
    const [storeCode, setStoreCode] = useState('')
    const [storeAddress, setStoreAddress] = useState('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        setMounted(true)
    }, [])

    const settings = store.settings || {}

    // Normalize Data (Handle both snake_case from DB and legacy camelCase)
    const bankName = settings.bank_name || settings.bankName
    const bankAccount = settings.bank_account || settings.bankAccount
    const accountName = settings.account_name || settings.accountName
    const paymentMessage = settings.payment_message || settings.paymentMessage

    const shippingFees = settings.shippingFees || {
        pickup: settings.shipping_pickup_fee ?? 0,
        '711': settings.shipping_711_fee ?? 60,
        home: settings.shipping_home_fee ?? 100,
    }

    // Dynamic Shipping Options with Fee Display logic if needed
    // Currently CheckoutShipping component likely renders these options.
    // If we want to show $0 in the selection list, we might need to modify how we pass data or how CheckoutShipping renders.
    // However, the requested feature is "checkout calculates free shipping".
    // The previous edit handles the calculation and total.
    // Let's verify components/CheckoutShipping.tsx next.

    const shippingOptions = [
        { id: 'pickup', label: settings.shipping_pickup_name || '面交取貨', description: '約定時間地點面交' },
        { id: '711', label: settings.shipping_711_name || '7-11 店到店', description: '寄送至指定 7-11 門市' },
        { id: 'home', label: settings.shipping_home_name || '宅配到府', description: '寄送至指定地址' },
    ]

    const subtotal = getCartTotal()
    const shippingFee = shippingFees[shippingMethod] || 0

    // Free Shipping Logic
    const freeShippingThreshold = settings.free_shipping_threshold || 0
    // 如果免運，折扣金額等於運費金額（全額折抵）
    const isFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold
    const shippingDiscount = isFreeShipping ? shippingFee : 0

    const total = subtotal + shippingFee - shippingDiscount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // 1. Create Order
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
                    paymentMethod,
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

            // 2. If Credit Card, Init ECPay
            // Note: We need to distinguish Payment Method from Shipping Method in UI ideally.
            // But user prompt was concise. I'll check if I should add separate Payment Method.
            // For now, I'll assume we add a "Credit Card" payment mode if I add UI.
            // But wait, the current UI mixes Shipping with "Method".
            // I should add a "Payment Method" section.

            // Assuming we added 'paymentMethod state'
            if (paymentMethod === 'credit_card') {
                try {
                    const ecpayRes = await fetch('/api/store/checkout/ecpay', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId: data.orderId, // UUID from response
                            amount: total,
                            items: items,
                            tenantId: store.id
                        })
                    })
                    const ecpayData = await ecpayRes.json()

                    if (!ecpayData.success) {
                        throw new Error(ecpayData.error || '綠界支付初始化失敗')
                    }

                    console.log('ECPay Params Debug:', ecpayData.params) // Debug Log
                    // Auto Submit Form
                    const form = document.createElement('form')
                    form.method = 'POST'
                    form.action = ecpayData.paymentUrl

                    for (const [key, val] of Object.entries(ecpayData.params)) {
                        const input = document.createElement('input')
                        input.type = 'hidden'
                        input.name = key
                        input.value = val as string
                        form.appendChild(input)
                    }
                    document.body.appendChild(form)
                    form.submit()
                    return // Stop here, redirecting
                } catch (e: any) {
                    console.error('ECPay Init Failed', e)
                    setError(e.message || '前往付款失敗，請稍後再試')
                    setLoading(false)
                    return
                }
            }

            setOrderNumber(data.orderNumber)
            setFinalTotal(total)
            setSuccess(true)
            clearCart()
        } catch (err: any) {
            setError(err.message)
        } finally {
            if (paymentMethod !== 'credit_card') setLoading(false)
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

                    {bankName && (
                        <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2">匯款資訊</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p>銀行：{bankName}</p>
                                <p>帳號：{bankAccount}</p>
                                <p>戶名：{accountName}</p>
                            </div>
                            <p className="mt-3 text-rose-500 font-medium">
                                應付金額：NT$ {finalTotal.toLocaleString()}
                            </p>
                        </div>
                    )}

                    {paymentMessage && (
                        <p className="text-sm text-gray-500 mb-6">{paymentMessage}</p>
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
                <div className="max-w-[1200px] mx-auto px-4 py-4">
                    <Link
                        href={`/store/${store.slug}`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">{store.name}</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">結帳</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Order Items */}
                    <CheckoutOrderItems items={items} />

                    {/* Customer Info */}
                    <CheckoutCustomerInfo
                        customerName={customerName}
                        setCustomerName={setCustomerName}
                        customerPhone={customerPhone}
                        setCustomerPhone={setCustomerPhone}
                        customerEmail={customerEmail}
                        setCustomerEmail={setCustomerEmail}
                        customerLineId={customerLineId}
                        setCustomerLineId={setCustomerLineId}
                    />

                    {/* Shipping */}
                    <CheckoutShipping
                        shippingMethod={shippingMethod}
                        setShippingMethod={setShippingMethod}
                        storeName={storeName}
                        setStoreName={setStoreName}
                        storeCode={storeCode}
                        setStoreCode={setStoreCode}
                        storeAddress={storeAddress}
                        setStoreAddress={setStoreAddress}
                        shippingOptions={shippingOptions}
                        shippingFees={shippingFees}
                    />

                    {/* Payment Method */}
                    <CheckoutPayment
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        settings={settings}
                    />

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
                    <CheckoutSummary
                        subtotal={subtotal}
                        shippingFee={shippingFee}
                        shippingDiscount={shippingDiscount}
                        total={total}
                    />

                    {/* Payment Info (Bank Transfer) Preview logic could also be extracted but kept simple here for now */}
                    {bankName && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">匯款資訊</h2>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-600">
                                <p><span className="font-medium text-gray-900">銀行：</span>{bankName}</p>
                                <p><span className="font-medium text-gray-900">帳號：</span>{bankAccount}</p>
                                <p><span className="font-medium text-gray-900">戶名：</span>{accountName}</p>
                                {paymentMessage && (
                                    <p className="pt-2 text-gray-500 border-t border-gray-200 mt-2">
                                        {paymentMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

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

