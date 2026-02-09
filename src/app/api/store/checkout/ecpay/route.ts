import { NextResponse } from 'next/server'
import { ECPayAdapter } from '@/lib/payments/ecpay'
import { createClient } from '@/lib/supabase/server'
import { getRawPaymentCredentials } from '@/features/payment/actions'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { orderId, amount, items, tenantId } = body

        // 1. Validate required fields
        if (!orderId || !amount || !tenantId) {
            return NextResponse.json({
                error: '缺少必要參數 (orderId, amount, tenantId)'
            }, { status: 400 })
        }

        // 2. Fetch order and tenant-specific payment credentials
        const supabase = await createClient()
        const { data: order } = await supabase
            .from('orders')
            .select('order_number, tenant_id')
            .eq('id', orderId)
            .single()

        if (!order) {
            return NextResponse.json({
                error: '查無此訂單'
            }, { status: 404 })
        }

        // Use tenantId from order if not provided in body (safer)
        const targetTenantId = tenantId || order.tenant_id

        const credentials = await getRawPaymentCredentials(targetTenantId)

        if (!credentials) {
            return NextResponse.json({
                error: '商店尚未設定收款資訊，請聯繫商家。'
            }, { status: 400 })
        }

        // 3. Create tenant-specific ECPay adapter
        const ecpay = new ECPayAdapter(credentials)

        // 4. Generate ECPay Params
        const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://omoselect.com'}/api/store/checkout/callback`
        const clientBackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://omoselect.com'}/store/checkout/success`

        const itemName = items?.map((i: any) => i.name).join('#').substring(0, 50) || 'Order'

        // Use order_number as MerchantTradeNo (max 20 chars)
        // Ensure it is not too long. If null, fallback to something (but it shouldn't be null)
        const merchantTradeNo = order.order_number || orderId.substring(0, 20)

        const params = ecpay.createOrder(merchantTradeNo, amount, itemName, returnUrl, clientBackUrl)

        return NextResponse.json({
            success: true,
            paymentUrl: ecpay.apiUrl + '/Cashier/AioCheckOut/V5',
            params
        })

    } catch (e: any) {
        console.error('[Checkout ECPay Error]:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
