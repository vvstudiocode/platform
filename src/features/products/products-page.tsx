'use client'

import Link from 'next/link'
import { Plus, Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductList } from './components/product-list'

export interface Product {
    id: string
    sku: string | null
    name: string
    brand: string | null
    category: string | null
    price: number
    cost: number
    stock: number
    image_url: string | null
    status: 'draft' | 'active' | 'archived'
    sort_order: number
}

interface ProductsPageProps {
    products: Product[]
    basePath: string // '/admin/products' or '/app/products'
    deleteAction: (id: string) => Promise<{ error?: string; success?: boolean }>
    updateStatusAction: (id: string, status: string) => Promise<{ error?: string; success?: boolean }>
    updateOrderAction: (items: { id: string; order: number }[]) => Promise<{ error?: string; success?: boolean }>
}

export function ProductsPage({
    products,
    basePath,
    deleteAction,
    updateStatusAction,
    updateOrderAction,
}: ProductsPageProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-foreground">商品管理</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 border-border hover:bg-muted">
                        <Download className="h-4 w-4" />
                        匯出 CSV
                    </Button>
                    <Link href={`${basePath}/new`}>
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
            <ProductList
                initialProducts={products}
                basePath={basePath}
                deleteAction={deleteAction}
                updateStatusAction={updateStatusAction}
                updateOrderAction={updateOrderAction}
            />
        </div>
    )
}
