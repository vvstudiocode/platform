'use client'

import { useActionState, useState, useEffect } from 'react'
import { createProduct } from './actions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, X } from 'lucide-react'
import React, { use } from 'react'
import Link from 'next/link'
import { ProductImagesInput, ImageItem } from '@/components/admin/product-images-input'
import { ProductVariantsEditor, ProductOption, ProductVariant } from '@/components/admin/product-variants-editor'
import { Combobox } from '@/components/ui/combobox'

const initialState = { error: '' }

export default function TenantNewProductPage({ params }: { params: Promise<{ storeId: string }> }) {
    const { storeId } = use(params)
    const [state, formAction, pending] = useActionState(createProduct, initialState)

    // Legacy image preview state (can be removed if not used elsewhere, but keeping just in case)
    const [imagePreview, setImagePreview] = useState('')

    // New State
    const [brands, setBrands] = useState<{ id: string, name: string }[]>([])
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        fetch(`/api/products/attributes?tenantId=${storeId}`)
            .then(res => res.json())
            .then(data => {
                if (data.brands) setBrands(data.brands)
                if (data.categories) setCategories(data.categories)
            })
            .catch(console.error)
    }, [storeId])

    // New State
    const [images, setImages] = useState<ImageItem[]>([])
    const [options, setOptions] = useState<ProductOption[]>([])
    const [variants, setVariants] = useState<ProductVariant[]>([])
    const [price, setPrice] = useState('0')
    const [stock, setStock] = useState('0')
    const [sku, setSku] = useState('')

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        setImagePreview(url)
        // Also update images state if empty
        if (images.length === 0 && url) {
            setImages([{ type: 'url', id: url, url }])
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <CardHeader className="border-b border-zinc-800">
                    <CardTitle className="text-white">建立新商品</CardTitle>
                    <CardDescription className="text-zinc-400">
                        為您的商店新增一個商品
                    </CardDescription>
                </CardHeader>
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="storeId" value={storeId} />
                    <input type="hidden" name="images" value={JSON.stringify(images.map(i => i.type === 'url' ? i.url : (i as any).preview || ''))} />
                    <input type="hidden" name="options" value={JSON.stringify(options)} />
                    <input type="hidden" name="variants" value={JSON.stringify(variants)} />
                    <input type="hidden" name="imageUrl" value={(images[0] as any)?.url || (images[0] as any)?.preview || ''} />

                    <CardContent className="space-y-6 pt-6">
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
                                    <Combobox
                                        name="brand"
                                        options={brands.map(b => ({ value: b.name, label: b.name }))}
                                        placeholder="選擇或輸入品牌"
                                        searchPlaceholder="搜尋品牌..."
                                        allowCustom
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-zinc-300">分類</Label>
                                    <Combobox
                                        name="category"
                                        options={categories.map(c => ({ value: c.name, label: c.name }))}
                                        placeholder="選擇或輸入分類"
                                        searchPlaceholder="搜尋分類..."
                                        allowCustom
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
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
                        </div>

                        {/* 商品圖片 */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-300 border-b border-zinc-800 pb-2">商品圖片</h3>
                            <ProductImagesInput
                                items={images}
                                onChange={setImages}
                                maxImages={5}
                            />
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
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
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
                                    <Label htmlFor="stock" className="text-zinc-300">基本庫存 *</Label>
                                    <Input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        required
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
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
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 規格設定 */}
                        <div className="space-y-4">
                            <ProductVariantsEditor
                                basePrice={Number(price) || 0}
                                baseStock={Number(stock) || 0}
                                baseSku={sku}
                                onChange={(data) => {
                                    setOptions(data.options)
                                    setVariants(data.variants)
                                }}
                            />
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
            </div>
        </div>
    )
}
