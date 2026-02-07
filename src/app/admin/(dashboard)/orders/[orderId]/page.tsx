import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, Mail, MapPin, Package, MessageSquare } from 'lucide-react'
import { OrderStatusSelect } from './order-status-select'

interface Props {
    params: Promise<{ orderId: string }>
}

export default async function OrderDetailPage({ params }: Props) {
    const { orderId } = await params
    const supabase = await createClient()

    const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
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

    const { data: tenant } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', order.tenant_id!)
        .single()

    const settings = (tenant?.settings as any) || {}

    const shippingLabels: Record<string, string> = {
        pickup: settings.shipping_pickup_name || '面交取貨',
        '711': settings.shipping_711_name || '7-11 店到店',
        home: settings.shipping_home_name || '宅配到府',
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">訂單詳情</h1>
                        <p className="text-zinc-400 font-mono">{order.order_number}</p>
                    </div>
                </div>
                <OrderStatusSelect orderId={order.id} currentStatus={order.status || ''} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* 客戶資訊 */}
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">客戶資訊</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-zinc-300">
                            <User className="h-4 w-4 text-zinc-500" />
                            {order.customer_name}
                        </div>
                        <div className="flex items-center gap-3 text-zinc-300">
                            <Phone className="h-4 w-4 text-zinc-500" />
                            {order.customer_phone}
                        </div>
                        {order.customer_email && (
                            <div className="flex items-center gap-3 text-zinc-300">
                                <Mail className="h-4 w-4 text-zinc-500" />
                                {order.customer_email}
                            </div>
                        )}
                        {order.customer_line_id && (
                            <div className="flex items-center gap-3 text-zinc-300">
                                <MessageSquare className="h-4 w-4 text-zinc-500" />
                                {order.customer_line_id}
                            </div>
                        )}
                    </div>
                </div>

                {/* 配送資訊 */}
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">配送資訊</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-zinc-300">
                            <Package className="h-4 w-4 text-zinc-500" />
                            {shippingLabels[order.shipping_method || ''] || order.shipping_method}
                        </div>
                        {order.shipping_method === '711' && order.store_name && (
                            <div className="flex items-center gap-3 text-zinc-300">
                                <MapPin className="h-4 w-4 text-zinc-500" />
                                {order.store_name} ({order.store_code})
                            </div>
                        )}
                        {order.shipping_method === 'home' && order.store_address && (
                            <div className="flex items-center gap-3 text-zinc-300">
                                <MapPin className="h-4 w-4 text-zinc-500" />
                                {order.store_address}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 訂單內容 */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800">
                    <h2 className="text-lg font-semibold text-white">訂單商品</h2>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">商品</th>
                            <th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">單價</th>
                            <th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">數量</th>
                            <th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">小計</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} className="border-b border-zinc-800">
                                <td className="px-6 py-4">
                                    <p className="text-white">{item.name}</p>
                                    {item.options && Object.keys(item.options).length > 0 && (
                                        <p className="text-sm text-zinc-500">
                                            {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                        </p>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right text-zinc-300">
                                    NT$ {item.price.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right text-zinc-300">
                                    {item.quantity}
                                </td>
                                <td className="px-6 py-4 text-right text-white font-medium">
                                    NT$ {(item.price * item.quantity).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-b border-zinc-800">
                            <td colSpan={3} className="px-6 py-3 text-right text-zinc-400">商品小計</td>
                            <td className="px-6 py-3 text-right text-white">NT$ {Number(order.subtotal).toLocaleString()}</td>
                        </tr>
                        <tr className="border-b border-zinc-800">
                            <td colSpan={3} className="px-6 py-3 text-right text-zinc-400">運費</td>
                            <td className="px-6 py-3 text-right text-white">NT$ {Number(order.shipping_fee).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td colSpan={3} className="px-6 py-4 text-right text-lg font-semibold text-white">總計</td>
                            <td className="px-6 py-4 text-right text-lg font-bold text-emerald-400">NT$ {Number(order.total).toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* 備註 */}
            {order.notes && (
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                    <h2 className="text-lg font-semibold text-white mb-2">客戶備註</h2>
                    <p className="text-zinc-300 whitespace-pre-wrap">{order.notes}</p>
                </div>
            )}

            {/* 時間紀錄 */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">時間紀錄</h2>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-zinc-500">建立時間</p>
                        <p className="text-zinc-300">{order.created_at ? new Date(order.created_at).toLocaleString('zh-TW') : '-'}</p>
                    </div>
                    {(order as any).paid_at && (
                        <div>
                            <p className="text-zinc-500">付款時間</p>
                            <p className="text-zinc-300">{new Date((order as any).paid_at).toLocaleString('zh-TW')}</p>
                        </div>
                    )}
                    {(order as any).shipped_at && (
                        <div>
                            <p className="text-zinc-500">出貨時間</p>
                            <p className="text-zinc-300">{new Date((order as any).shipped_at).toLocaleString('zh-TW')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
