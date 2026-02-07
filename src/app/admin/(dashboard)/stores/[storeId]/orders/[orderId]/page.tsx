import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, Phone, Mail, User, MessageSquare, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrderStatusSelect } from './order-status-select'

interface Props {
    params: Promise<{ storeId: string; orderId: string }>
}

export default async function OrderDetailPage({ params }: Props) {
    const { storeId, orderId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 驗證商店所有權
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('id', storeId)
        .eq('managed_by', user?.id || '')
        .single()

    if (!store) {
        notFound()
    }

    // 取得訂單
    const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('tenant_id', storeId)
        .single()

    if (!order) {
        notFound()
    }

    const items = order.items as Array<{
        product_id: string
        name: string
        price: number
        quantity: number
        options?: Record<string, string>
    }>

    const shippingLabels: Record<string, string> = {
        pickup: '面交取貨',
        '711': '7-11 店到店',
        home: '宅配到府',
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <Link
                    href={`/admin/stores/${storeId}/orders`}
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    返回訂單列表
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">訂單 {order.order_number}</h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            建立於 {order.created_at ? new Date(order.created_at).toLocaleString('zh-TW') : '-'}
                        </p>
                    </div>
                    <OrderStatusSelect
                        orderId={orderId}
                        storeId={storeId}
                        currentStatus={order.status || ''}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 客戶資訊 */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        客戶資訊
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-zinc-300">
                            <User className="h-4 w-4 text-zinc-500" />
                            {order.customer_name}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300">
                            <Phone className="h-4 w-4 text-zinc-500" />
                            {order.customer_phone}
                        </div>
                        {order.customer_email && (
                            <div className="flex items-center gap-2 text-zinc-300">
                                <Mail className="h-4 w-4 text-zinc-500" />
                                {order.customer_email}
                            </div>
                        )}
                        {order.customer_line_id && (
                            <div className="flex items-center gap-2 text-zinc-300">
                                <MessageSquare className="h-4 w-4 text-zinc-500" />
                                Line: {order.customer_line_id}
                            </div>
                        )}
                    </div>
                </div>

                {/* 配送資訊 */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        配送資訊
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">配送方式</span>
                            <span className="text-zinc-300">{shippingLabels[order.shipping_method || ''] || order.shipping_method}</span>
                        </div>
                        {order.store_name && (
                            <div className="flex justify-between">
                                <span className="text-zinc-500">門市名稱</span>
                                <span className="text-zinc-300">{order.store_name}</span>
                            </div>
                        )}
                        {order.store_code && (
                            <div className="flex justify-between">
                                <span className="text-zinc-500">門市店號</span>
                                <span className="text-zinc-300">{order.store_code}</span>
                            </div>
                        )}
                        {order.store_address && (
                            <div className="flex items-start gap-2 pt-2 border-t border-zinc-800">
                                <MapPin className="h-4 w-4 text-zinc-500 mt-0.5" />
                                <span className="text-zinc-300">{order.store_address}</span>
                            </div>
                        )}
                        {(order as any).tracking_number && (
                            <div className="flex justify-between pt-2 border-t border-zinc-800">
                                <span className="text-zinc-500">物流單號</span>
                                <span className="text-white font-mono">{(order as any).tracking_number}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 訂單商品 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        訂單商品
                    </h2>
                </div>
                <div className="divide-y divide-zinc-800">
                    {items.map((item, idx) => (
                        <div key={idx} className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-white">{item.name}</p>
                                {item.options && Object.keys(item.options).length > 0 && (
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-white">NT$ {Number(item.price).toLocaleString()}</p>
                                <p className="text-xs text-zinc-500">× {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-800/30">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-400">小計</span>
                        <span className="text-zinc-300">NT$ {Number(order.subtotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-400">運費</span>
                        <span className="text-zinc-300">NT$ {Number(order.shipping_fee).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-700">
                        <span className="text-white">總計</span>
                        <span className="text-white">NT$ {Number(order.total).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* 備註 */}
            {order.notes && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                    <h2 className="font-semibold text-white mb-2">客戶備註</h2>
                    <p className="text-zinc-300 whitespace-pre-wrap">{order.notes}</p>
                </div>
            )}
        </div>
    )
}
