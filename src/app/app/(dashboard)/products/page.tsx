import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Package, Search, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppProductDeleteButton } from './product-delete-button'

async function getUserStoreId(supabase: any, userId: string) {
    const { data } = await supabase
        .from('users_roles')
        .select('tenant_id')
        .eq('user_id', userId)
        .in('role', ['store_owner', 'store_admin'])
        .single()
    return data?.tenant_id
}

export default async function AppProductsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/app/login')

    const storeId = await getUserStoreId(supabase, user.id)
    if (!storeId) redirect('/app/onboarding')

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', storeId)
        .order('created_at', { ascending: false })

    const statusLabels: Record<string, string> = {
        active: '上架中',
        draft: '草稿',
        archived: '已下架',
    }

    const statusColors: Record<string, string> = {
        active: 'bg-emerald-500/20 text-emerald-400',
        draft: 'bg-zinc-500/20 text-zinc-400',
        archived: 'bg-red-500/20 text-red-400',
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">商品管理</h1>
                <Link href="/app/products/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        新增商品
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="搜尋商品..."
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Table */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">商品</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">價格</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">庫存</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">狀態</th>
                            <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products && products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-5 w-5 text-zinc-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{product.name}</p>
                                                {product.brand && (
                                                    <p className="text-sm text-zinc-500">{product.brand}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-white">NT$ {Number(product.price).toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={product.stock <= 5 ? 'text-amber-400' : 'text-white'}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                                            {statusLabels[product.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/app/products/${product.id}`}>
                                                <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </Link>
                                            <AppProductDeleteButton productId={product.id} productName={product.name} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                    尚無商品
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
