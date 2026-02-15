import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Plus, Edit, Trash2, Image, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    params: Promise<{ storeId: string }>
}

export default async function StoreProductsPage({ params }: Props) {
    const { storeId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 驗證商店所有權
    const { data: store } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('id', storeId)
        .eq('managed_by', user?.id || '')
        .single()

    if (!store) {
        notFound()
    }

    // 取得商品
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', storeId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

    const statusColors: Record<string, string> = {
        active: 'bg-emerald-500/10 text-emerald-600',
        draft: 'bg-zinc-100 text-zinc-600',
        archived: 'bg-red-500/10 text-red-600',
    }

    const statusLabels: Record<string, string> = {
        active: '上架中',
        draft: '草稿',
        archived: '已下架',
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href={`/admin/stores/${storeId}`}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        返回 {store.name}
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">商品管理</h1>
                    <p className="text-muted-foreground text-sm mt-1">共 {products?.length || 0} 件商品</p>
                </div>
                <Link href={`/admin/stores/${storeId}/products/new`}>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        新增商品
                    </Button>
                </Link>
            </div>

            {products && products.length > 0 ? (
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr className="text-left">
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">商品</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">價格</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">成本</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">韓幣</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">庫存</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">狀態</th>
                                <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Image className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{product.name}</p>
                                                {product.brand && (
                                                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-foreground">
                                        NT$ {product.price?.toLocaleString() || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-foreground">
                                        NT$ {product.cost?.toLocaleString() || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-foreground">
                                        ₩ {product.price_krw?.toLocaleString() || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`${(product.stock !== null && product.stock <= 5) ? 'text-amber-600 font-medium' : 'text-foreground'}`}>
                                            {product.stock || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status || 'draft'] || statusColors.draft}`}>
                                            {statusLabels[product.status || 'draft'] || '草稿'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/admin/stores/${storeId}/products/${product.id}`}>
                                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">尚未有任何商品</h3>
                    <p className="text-muted-foreground mt-1 mb-4">為此商店新增第一個商品</p>
                    <Link href={`/admin/stores/${storeId}/products/new`}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            新增商品
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}

