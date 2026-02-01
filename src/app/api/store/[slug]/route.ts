import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Params {
    params: Promise<{ slug: string }>
}

// 取得商店公開商品
export async function GET(request: NextRequest, { params }: Params) {
    const { slug } = await params
    const supabase = await createClient()

    // 取得商店
    const { data: store, error: storeError } = await supabase
        .from('tenants')
        .select('id, name, slug, settings')
        .eq('slug', slug)
        .single()

    if (storeError || !store) {
        return NextResponse.json(
            { error: '找不到此商店' },
            { status: 404 }
        )
    }

    // 取得商品
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, description, price, stock, image_url, category, brand, options, variants')
        .eq('tenant_id', store.id)
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

    if (productsError) {
        return NextResponse.json(
            { error: productsError.message },
            { status: 500 }
        )
    }

    return NextResponse.json({
        store: {
            id: store.id,
            name: store.name,
            slug: store.slug,
            settings: store.settings,
        },
        products,
    })
}
