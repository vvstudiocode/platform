'use client'

import { useActionState, useState, useEffect } from 'react'
import { updateProduct } from '../new/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Trash2, X } from 'lucide-react'
import Link from 'next/link'

interface Props {
    product: {
        id: string
        name: string
        description: string | null
        brand: string | null
        category: string | null
        price: number
        cost: number
        stock: number
        price_krw: number
        sku: string | null
        image_url: string | null
        status: string
    }
    storeId: string
    storeName: string
}

const initialState = { error: '' }

export function ProductEditForm({ product, storeId, storeName }: Props) {
    const [state, formAction, pending] = useActionState(updateProduct, initialState)
    const [imagePreview, setImagePreview] = useState<string>(product.image_url || '')

    return (
        <div className="max-w-2xl">
            <Link
                href={`/admin/stores/${storeId}/products`}
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                返回商品列表
            </Link>

            <Card className="border-zinc-800 bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-white">編輯商品</CardTitle>
                    <CardDescription className="text-zinc-400">
                        {storeName} - {product.name}
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <input type="hidden" name="storeId" value={storeId} />
                    <input type="hidden" name="productId" value={product.id} />
                    <CardContent className="space-y-6">
                        {/* 基本資訊 */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-300 border-b border-zinc-800 pb-2">基本資訊</h3>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="name" className="text-zinc-300">商品名稱 *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={product.name}
                                        required
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brand" className="text-zinc-300">品牌</Label>
                                    <Input
                                        id="brand"
                                        name="brand"
                                        defaultValue={product.brand || ''}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-zinc-300">分類</Label>
                                    <Input
                                        id="category"
                                        name="category"
                                        defaultValue={product.category || ''}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-zinc-300">商品描述</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    defaultValue={product.description || ''}
                                    className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2"
                                />
                            </div>
                        </div>

                        {/* 價格與庫存 */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-300 border-b border-zinc-800 pb-2">價格與庫存</h3>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-zinc-300">售價 (NT$) *</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        defaultValue={product.price}
                                        required
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cost" className="text-zinc-300">成本 (NT$)</Label>
                                    <Input
                                        id="cost"
                                        name="cost"
                                        type="number"
                                        min="0"
                                        defaultValue={product.cost}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stock" className="text-zinc-300">庫存數量 *</Label>
                                    <Input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        defaultValue={product.stock}
                                        required
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="priceKrw" className="text-zinc-300">韓幣價格 (₩)</Label>
                                    <Input
                                        id="priceKrw"
                                        name="priceKrw"
                                        type="number"
                                        min="0"
                                        defaultValue={product.price_krw}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sku" className="text-zinc-300">SKU 編號</Label>
                                    <Input
                                        id="sku"
                                        name="sku"
                                        defaultValue={product.sku || ''}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 商品圖片 */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-300 border-b border-zinc-800 pb-2">商品圖片</h3>

                            <div className="space-y-2">
                                <Label htmlFor="imageUrl" className="text-zinc-300">圖片網址</Label>
                                <Input
                                    id="imageUrl"
                                    name="imageUrl"
                                    defaultValue={product.image_url || ''}
                                    onChange={(e) => setImagePreview(e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                />
                            </div>

                            {imagePreview && (
                                <div className="relative w-32 h-32 rounded-lg bg-zinc-800 overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={() => setImagePreview('')}
                                    />
                                </div>
                            )}
                        </div>

                        {/* 狀態 */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-300 border-b border-zinc-800 pb-2">發佈狀態</h3>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="draft"
                                        defaultChecked={product.status === 'draft'}
                                    />
                                    <span className="text-zinc-300">草稿</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        defaultChecked={product.status === 'active'}
                                    />
                                    <span className="text-zinc-300">上架中</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="archived"
                                        defaultChecked={product.status === 'archived'}
                                    />
                                    <span className="text-zinc-300">已下架</span>
                                </label>
                            </div>
                        </div>

                        {state?.error && (
                            <div className="text-sm text-red-400 font-medium bg-red-950/50 border border-red-900 p-3 rounded-lg">
                                {state.error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Link href={`/admin/stores/${storeId}/products`} className="flex-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-zinc-700 text-zinc-300 hover:text-white"
                                >
                                    取消
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={pending}
                                className="flex-1 bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
                            >
                                {pending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        儲存中...
                                    </>
                                ) : (
                                    '儲存變更'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    )
}
