'use client'

import { useActionState, useState, useEffect } from 'react'
import { updateProduct } from '../new/actions'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductImagesInput, ImageItem } from '@/components/admin/product-images-input'
import { ProductVariantsEditor, ProductOption, ProductVariant } from '@/components/admin/product-variants-editor'
import { Combobox } from '@/components/ui/combobox'

interface Props {
    product: {
        id: string
        name: string
        description: string | null
        brand: string | null
        category: string | null
        price: number
        cost: number | null
        price_krw: number | null
        stock: number
        sku: string | null
        image_url: string | null
        status: string
        seo_title?: string | null
        seo_description?: string | null
        seo_keywords?: string | null
        images: string[]
        options: ProductOption[]
        variants: ProductVariant[]
    }
    storeId: string
    storeName: string
    storeSlug: string
}

export function ProductEditForm({ product, storeId, storeName, storeSlug }: Props) {
    const [state, formAction, pending] = useActionState(updateProduct, { error: '' })

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

    const initialImages: ImageItem[] = (product.images && product.images.length > 0
        ? product.images
        : (product.image_url ? [product.image_url] : [])
    ).map(url => ({
        type: 'url',
        id: url,
        url: url
    }))

    const [images, setImages] = useState<ImageItem[]>(initialImages)
    const [options, setOptions] = useState<ProductOption[]>(product.options || [])
    const [variants, setVariants] = useState<ProductVariant[]>(product.variants || [])

    // Controlled inputs for base values
    const [price, setPrice] = useState(product.price)
    const [stock, setStock] = useState(product.stock)
    const [sku, setSku] = useState(product.sku || '')

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/stores/${storeId}/products`}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            <a
                                href={`${window.location.protocol}//${storeSlug}.${window.location.host.replace('admin.', '')}/product/${product.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline underline-offset-4 decoration-zinc-500"
                            >
                                {product.name}
                            </a>
                        </h1>
                        <p className="text-sm text-zinc-400">{storeName}</p>
                    </div>
                </div>
            </div>

            {state?.error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
                    {state.error}
                </div>
            )}

            <form action={formAction} className="space-y-6">
                <input type="hidden" name="storeId" value={storeId} />
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="images" value={JSON.stringify(images.map(i => i.type === 'url' ? i.url : (i as any).preview || ''))} />
                <input type="hidden" name="options" value={JSON.stringify(options)} />
                <input type="hidden" name="variants" value={JSON.stringify(variants)} />
                <input type="hidden" name="imageUrl" value={(images[0] as any)?.url || (images[0] as any)?.preview || ''} />

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="border-b border-zinc-800">
                        <CardTitle className="text-white">商品資訊</CardTitle>
                        <CardDescription className="text-zinc-400">
                            編輯商品資訊與詳細設定
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* 基本資訊 */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-300 border-b border-zinc-800 pb-2">基本資訊</h3>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name" className="text-zinc-300">商品名稱 *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        defaultValue={product.name}
                                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="brand" className="text-zinc-300">品牌</Label>
                                    <Combobox
                                        name="brand"
                                        options={brands.map(b => ({ value: b.name, label: b.name }))}
                                        defaultValue={product.brand || ''}
                                        placeholder="選擇或輸入品牌"
                                        searchPlaceholder="搜尋品牌..."
                                        allowCustom
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category" className="text-zinc-300">分類</Label>
                                    <Combobox
                                        name="category"
                                        options={categories.map(c => ({ value: c.name, label: c.name }))}
                                        defaultValue={product.category || ''}
                                        placeholder="選擇或輸入分類"
                                        searchPlaceholder="搜尋分類..."
                                        allowCustom
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="description" className="text-zinc-300">商品描述</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        defaultValue={product.description || ''}
                                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 圖片管理 */}
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
                                <div>
                                    <Label htmlFor="price" className="text-zinc-300">售價 (NTD) *</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        required
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cost" className="text-zinc-300">成本</Label>
                                    <Input
                                        id="cost"
                                        name="cost"
                                        type="number"
                                        min="0"
                                        defaultValue={product.cost || 0}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="price_krw" className="text-zinc-300">韓幣價格</Label>
                                    <Input
                                        id="price_krw"
                                        name="price_krw"
                                        type="number"
                                        min="0"
                                        defaultValue={product.price_krw || 0}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="stock" className="text-zinc-300">基本庫存 *</Label>
                                    <Input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        value={stock}
                                        onChange={(e) => setStock(Number(e.target.value))}
                                        required
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sku" className="text-zinc-300">SKU</Label>
                                    <Input
                                        id="sku"
                                        name="sku"
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 規格設定 */}
                        <div className="space-y-4">
                            <ProductVariantsEditor
                                initialOptions={options}
                                initialVariants={variants}
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
                            <h3 className="text-sm font-medium text-zinc-300 border-b border-zinc-800 pb-2">狀態</h3>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="status" className="text-zinc-300">狀態</Label>
                                    <select
                                        id="status"
                                        name="status"
                                        defaultValue={product.status}
                                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="draft">草稿</option>
                                        <option value="active">上架</option>
                                        <option value="archived">下架</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SEO 設定 */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-300 border-b border-zinc-800 pb-2">SEO 設定</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="seoTitle" className="text-zinc-300">SEO 標題</Label>
                                    <Input
                                        id="seoTitle"
                                        name="seoTitle"
                                        defaultValue={product.seo_title || ''}
                                        placeholder="搜尋引擎顯示的標題"
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="seoDescription" className="text-zinc-300">SEO 描述</Label>
                                    <textarea
                                        id="seoDescription"
                                        name="seoDescription"
                                        rows={3}
                                        defaultValue={product.seo_description || ''}
                                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="搜尋引擎顯示的描述"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="seoKeywords" className="text-zinc-300">SEO 關鍵字</Label>
                                    <Input
                                        id="seoKeywords"
                                        name="seoKeywords"
                                        defaultValue={product.seo_keywords || ''}
                                        placeholder="例如：美妝, 護膚"
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                            <Link href={`/admin/stores/${storeId}/products`}>
                                <Button type="button" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">取消</Button>
                            </Link>
                            <Button type="submit" disabled={pending} className="bg-white text-black hover:bg-zinc-200">
                                {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                儲存變更
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
