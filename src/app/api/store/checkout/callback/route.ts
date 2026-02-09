
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const data: Record<string, string> = {}
        formData.forEach((value, key) => {
            data[key] = value as string
        })

        console.log('[Store Checkout] Callback received:', data)

        const merchantTradeNo = data.MerchantTradeNo

        // Create Admin Client to bypass RLS
        const supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Find the order by order_number (assuming MerchantTradeNo IS order_number)
        // OR by id if possible. 
        // We will try matching order_number first, as it's shorter.
        // If not found, try id.

        let order;

        const { data: orderByNo } = await supabase
            .from('orders')
            .select('id, total, status, tenant_id, order_number')
            .eq('order_number', merchantTradeNo)
            .maybeSingle()

        if (orderByNo) {
            order = orderByNo;
        } else {
            // Try valid UUID format only to avoid DB error
            if (merchantTradeNo.length === 36) {
                const { data: orderById } = await supabase
                    .from('orders')
                    .select('id, total, status, tenant_id, order_number')
                    .eq('id', merchantTradeNo)
                    .maybeSingle()
                order = orderById;
            }
        }

        if (!order) {
            console.error('[Store Checkout] Order not found for TradeNo:', merchantTradeNo)
            return new NextResponse('0|Order Not Found', { status: 404 })
        }

        // Fetch tenant credentials
        const { getRawPaymentCredentials } = await import('@/features/payment/actions')
        const credentials = await getRawPaymentCredentials(order.tenant_id)

        if (!credentials) {
            console.error('[Store Checkout] No payment credentials for tenant:', order.tenant_id)
            return new NextResponse('0|No Credentials', { status: 500 })
        }

        // Verify Signature
        const { ECPayAdapter } = await import('@/lib/payments/ecpay')
        const adapter = new ECPayAdapter(credentials)

        if (!adapter.verifyCheckMacValue(data)) {
            console.error('[Store Checkout] Signature verification failed')
            return new NextResponse('0|CheckMacValue Error', { status: 400 })
        }

        // Check RtnCode
        if (data.RtnCode === '1') {
            // Success
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    status: 'paid',
                    payment_status: 'paid',
                    paid_at: new Date().toISOString(),
                    payment_method: 'credit_card',
                    payment_info: data
                })
                .eq('id', order.id)

            if (updateError) {
                console.error('[Store Checkout] DB Update Error:', updateError)
                return new NextResponse('0|DB Error', { status: 500 })
            }

            console.log(`[Store Checkout] Order ${order.order_number} marked as paid.`)
        } else {
            console.warn('[Store Checkout] Payment failed:', data.RtnMsg)
        }

        return new NextResponse('1|OK')

    } catch (e) {
        console.error('[Store Checkout] Error:', e)
        return new NextResponse('0|Error', { status: 500 })
    }
}
