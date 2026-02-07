import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductListClient } from './product-list-client'

// 取得或建立總部商店
async function getOrCreateHQStore(supabase: any, userId: string) {
    const { data: existing } = await supabase
        .from('tenants')
        .select('id')
        .eq('managed_by', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    if (existing) return existing.id

    const { data: newStore, error } = await supabase
        .from('tenants')
        .insert({
            name: '總部商店',
            slug: 'hq-' + Date.now(),
            managed_by: userId,
            description: '總部官方商店',
        })
        .select('id')
        .single()

    if (error) {
        console.error('建立總部商店失敗:', error)
        return null
    }

    return newStore?.id
}

export default async function AdminProductsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const hqStoreId = await getOrCreateHQStore(supabase, user.id)

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', hqStoreId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-foreground">商品管理</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 border-border hover:bg-muted">
                        <Download className="h-4 w-4" />
                        匯出 CSV
                    </Button>
                    <Link href="/admin/products/new">
                        <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90 shadow-soft">
                            <Plus className="h-4 w-4" />
                            新增商品
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="搜尋商品名稱、分類、品牌..."
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>

            {/* Product List */}
            <ProductListClient initialProducts={products?.map(p => ({
                ...p,
                cost: p.cost || 0,
                stock: p.stock || 0,
                status: (p.status as 'active' | 'draft' | 'archived') || 'draft',
                sort_order: p.sort_order || 0
            })) || []} />
        </div>
    )
}
