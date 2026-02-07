import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')?.split(',') || []

    if (ids.length === 0) {
        return NextResponse.json({ products: [] })
    }

    const supabase = await createClient()
    const { data: products, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .in('id', ids)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Sort by the order of IDs provided
    const sortedProducts = ids
        .map(id => products?.find(p => p.id === id))
        .filter(Boolean)

    return NextResponse.json({ products: sortedProducts })
}
