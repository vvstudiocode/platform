'use client'

import { useActionState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
    product: {
        id: string
        name: string
        description: string | null
        brand: string | null
        category: string | null
        price: number
        cost: number | null
        stock: number
        sku: string | null
        image_url: string | null
        status: string
    }
    updateAction: (prevState: any, formData: FormData) => Promise<{ error?: string }>
}

export function ProductEditForm({ product, updateAction }: Props) {
    const [state, formAction, pending] = useActionState(updateAction, { error: '' })

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app/products" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-white">編輯商品</h1>
            </div>

            {state.error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
                    {state.error}
                </div>
            )}

            <form action={formAction} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">基本資訊</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label htmlFor="name">商品名稱 *</Label>
                            <Input id="name" name="name" required defaultValue={product.name} />
                        </div>
                        <div>
                            <Label htmlFor="brand">品牌</Label>
                            <Input id="brand" name="brand" defaultValue={product.brand || ''} />
                        </div>
                        <div>
                            <Label htmlFor="category">分類</Label>
                            <Input id="category" name="category" defaultValue={product.category || ''} />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="description">商品描述</Label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                defaultValue={product.description || ''}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">價格與庫存</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="price">售價 (NTD) *</Label>
                            <Input id="price" name="price" type="number" min="0" required defaultValue={product.price} />
                        </div>
                        <div>
                            <Label htmlFor="cost">成本</Label>
                            <Input id="cost" name="cost" type="number" min="0" defaultValue={product.cost || 0} />
                        </div>
                        <div>
                            <Label htmlFor="stock">庫存數量 *</Label>
                            <Input id="stock" name="stock" type="number" min="0" defaultValue={product.stock} required />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">圖片與狀態</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label htmlFor="image_url">商品圖片網址</Label>
                            <Input id="image_url" name="image_url" type="url" defaultValue={product.image_url || ''} />
                            {product.image_url && (
                                <div className="mt-2">
                                    <img src={product.image_url} alt="" className="w-32 h-32 object-cover rounded-lg" />
                                </div>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="status">狀態</Label>
                            <select
                                id="status"
                                name="status"
                                defaultValue={product.status}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                            >
                                <option value="draft">草稿</option>
                                <option value="active">上架</option>
                                <option value="archived">下架</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <Link href="/app/products">
                        <Button type="button" variant="outline">取消</Button>
                    </Link>
                    <Button type="submit" disabled={pending}>
                        {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        儲存變更
                    </Button>
                </div>
            </form>
        </div>
    )
}
