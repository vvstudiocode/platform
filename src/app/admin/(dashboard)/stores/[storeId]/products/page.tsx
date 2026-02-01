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
        .eq('managed_by', user?.id)
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
        active: 'bg-emerald-500/20 text-emerald-400',
        draft: 'bg-zinc-500/20 text-zinc-400',
        archived: 'bg-red-500/20 text-red-400',
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
                        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        返回 {store.name}
                    </Link>
                    <h1 className="text-2xl font-bold text-white">商品管理</h1>
                    <p className="text-zinc-400 text-sm mt-1">共 {products?.length || 0} 件商品</p>
                </div>
                <Link href={`/admin/stores/${storeId}/products/new`}>
                    <Button className="bg-white text-black hover:bg-zinc-200">
                        <Plus className="h-4 w-4 mr-2" />
                        新增商品
                    </Button>
                </Link>
            </div>

            {products && products.length > 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-zinc-800/50">
                            <tr className="text-left">
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400">商品</th>
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400">價格</th>
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400">庫存</th>
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400">分類</th>
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400">狀態</th>
                                <th className="px-4 py-3 text-xs font-medium text-zinc-400 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-zinc-800/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Image className="h-4 w-4 text-zinc-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{product.name}</p>
                                                {product.brand && (
                                                    <p className="text-xs text-zinc-500">{product.brand}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-white">NT$ {Number(product.price).toLocaleString()}</p>
                                        {product.cost > 0 && (
                                            <p className="text-xs text-zinc-500">
                                                成本: ${Number(product.cost).toLocaleString()}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`${product.stock <= 5 ? 'text-amber-400' : 'text-zinc-300'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-zinc-400">{product.category || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${statusColors[product.status] || statusColors.draft}`}>
                                            {statusLabels[product.status] || product.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/admin/stores/${storeId}/products/${product.id}`}>
                                                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
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
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <Package className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">尚未有任何商品</h3>
                    <p className="text-zinc-400 mt-1 mb-4">為此商店新增第一個商品</p>
                    <Link href={`/admin/stores/${storeId}/products/new`}>
                        <Button className="bg-white text-black hover:bg-zinc-200">
                            <Plus className="h-4 w-4 mr-2" />
                            新增商品
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
