'use client'

import { useActionState, useState } from 'react'
import { createProduct } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, ImagePlus, X } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const initialState = { error: '' }

export default function NewProductPage() {
    const params = useParams()
    const storeId = params.storeId as string
    const [state, formAction, pending] = useActionState(createProduct, initialState)
    const [imagePreview, setImagePreview] = useState<string>('')

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        setImagePreview(url)
    }

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
                    <CardTitle className="text-white">新增商品</CardTitle>
                    <CardDescription className="text-zinc-400">
                        為您的商店新增一個商品
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <input type="hidden" name="storeId" value={storeId} />
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
                                        placeholder="例如：VT PDRN 精華液"
                                        required
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brand" className="text-zinc-300">品牌</Label>
                                    <Input
                                        id="brand"
                                        name="brand"
                                        placeholder="例如：VT Cosmetics"
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-zinc-300">分類</Label>
                                    <Input
                                        id="category"
                                        name="category"
                                        placeholder="例如：精華液"
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-zinc-300">商品描述</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    placeholder="請描述商品特色..."
                                    className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 px-3 py-2"
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
                                        placeholder="0"
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
                                        placeholder="0"
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
                                        placeholder="0"
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
                                        placeholder="0"
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sku" className="text-zinc-300">SKU 編號</Label>
                                    <Input
                                        id="sku"
                                        name="sku"
                                        placeholder="選填"
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
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
                                    placeholder="https://..."
                                    onChange={handleImageChange}
                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                />
                                <p className="text-xs text-zinc-500">支援 jpg, png, webp 格式</p>
                            </div>

                            {imagePreview && (
                                <div className="relative w-32 h-32 rounded-lg bg-zinc-800 overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={() => setImagePreview('')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setImagePreview('')}
                                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full"
                                    >
                                        <X className="h-3 w-3 text-white" />
                                    </button>
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
                                        defaultChecked
                                        className="text-white"
                                    />
                                    <span className="text-zinc-300">草稿</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        className="text-white"
                                    />
                                    <span className="text-zinc-300">立即上架</span>
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
                                        建立中...
                                    </>
                                ) : (
                                    '建立商品'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    )
}
