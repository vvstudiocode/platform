import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 新增訂單
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const supabase = await createClient()

        const {
            storeSlug,
            customerName,
            customerPhone,
            customerEmail,
            customerLineId,
            shippingMethod,
            storeName,
            storeCode,
            storeAddress,
            items,
            notes,
        } = body

        // 取得商店
        const { data: store, error: storeError } = await supabase
            .from('tenants')
            .select('id, settings')
            .eq('slug', storeSlug)
            .single()

        if (storeError || !store) {
            return NextResponse.json(
                { error: '找不到此商店' },
                { status: 404 }
            )
        }

        // 計算金額
        let subtotal = 0
        const orderItems = []

        for (const item of items) {
            const { data: product } = await supabase
                .from('products')
                .select('id, name, price, stock')
                .eq('id', item.productId)
                .eq('tenant_id', store.id)
                .single()

            if (!product) {
                return NextResponse.json(
                    { error: `找不到商品: ${item.productId}` },
                    { status: 400 }
                )
            }

            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { error: `商品 ${product.name} 庫存不足` },
                    { status: 400 }
                )
            }

            const itemTotal = Number(product.price) * item.quantity
            subtotal += itemTotal

            orderItems.push({
                product_id: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: item.quantity,
                options: item.options || {},
            })
        }

        // 計算運費
        const settings = store.settings as {
            shippingFees?: Record<string, number>
        } || {}
        const shippingFees = settings.shippingFees || {
            pickup: 0,
            '711': 60,
            home: 100,
        }
        const shippingFee = shippingFees[shippingMethod] || 0
        const total = subtotal + shippingFee

        // 生成訂單編號
        const orderNumber = generateOrderNumber()

        // 建立訂單
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                tenant_id: store.id,
                order_number: orderNumber,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: customerEmail || null,
                customer_line_id: customerLineId || null,
                shipping_method: shippingMethod,
                shipping_fee: shippingFee,
                store_name: storeName || null,
                store_code: storeCode || null,
                store_address: storeAddress || null,
                items: orderItems,
                subtotal,
                total,
                notes: notes || null,
            })
            .select()
            .single()

        if (orderError) {
            return NextResponse.json(
                { error: orderError.message },
                { status: 500 }
            )
        }

        // 扣除庫存
        for (const item of items) {
            await supabase.rpc('decrement_stock', {
                product_id: item.productId,
                amount: item.quantity,
            })
        }

        return NextResponse.json({
            success: true,
            orderNumber,
            total,
        })
    } catch (error) {
        console.error('Order creation error:', error)
        return NextResponse.json(
            { error: '訂單建立失敗' },
            { status: 500 }
        )
    }
}

// 查詢訂單
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const storeSlug = searchParams.get('store')

    if (!phone || !storeSlug) {
        return NextResponse.json(
            { error: '缺少必要參數' },
            { status: 400 }
        )
    }

    const supabase = await createClient()

    // 取得商店
    const { data: store } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', storeSlug)
        .single()

    if (!store) {
        return NextResponse.json(
            { error: '找不到此商店' },
            { status: 404 }
        )
    }

    // 查詢訂單
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', store.id)
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json({ orders })
}

function generateOrderNumber(): string {
    const now = new Date()
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${dateStr}${random}`
}
