import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 獲取商品列表和分類（用於頁面編輯器商品選擇）
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const cookieStore = await cookies()
        const tenantId = cookieStore.get('tenant_id')?.value

        if (!tenantId) {
            return NextResponse.json({ error: '未選擇商店' }, { status: 400 })
        }

        // 獲取該商店的所有商品
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, category, price, image_url, status')
            .eq('tenant_id', tenantId)
            .eq('status', 'active')
            .order('sort_order', { ascending: true })

        if (productsError) {
            throw productsError
        }

        // 提取唯一的分類列表
        const categories = [...new Set(
            products
                ?.map(p => p.category)
                .filter(Boolean) || []
        )].sort()

        return NextResponse.json({
            products: products || [],
            categories
        })
    } catch (error: any) {
        console.error('獲取商品列表失敗:', error)
        return NextResponse.json(
            { error: error.message || '獲取商品列表失敗' },
            { status: 500 }
        )
    }
}
