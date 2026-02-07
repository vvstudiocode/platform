import { NextResponse } from 'next/server'
import { ecpay } from '@/lib/payments/ecpay'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { orderId, amount, items } = body

        // 1. Verify Order Exists (Optional, mostly for security)
        const supabase = await createClient()
        // const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()

        // 2. Generate ECPay Params
        // URL for ECPay to notify us (Backend)
        const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://omoselect.com'}/api/store/checkout/callback`

        // URL for User to go back to (Frontend)
        const clientBackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://omoselect.com'}/store/checkout/success`

        const itemName = items.map((i: any) => i.name).join('#').substring(0, 50) + '...'

        const params = ecpay.createOrder(orderId, amount, itemName, returnUrl, clientBackUrl)

        return NextResponse.json({
            success: true,
            paymentUrl: ecpay.apiUrl + '/Cashier/AioCheckOut/V5', // Expose API URL
            params
        })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
