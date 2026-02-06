'use client'

import { useActionState, useState, useEffect } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { ProductImagesInput } from '@/components/admin/product-images-input'
import { ProductVariantsEditor, ProductOption, ProductVariant } from '@/components/admin/product-variants-editor'

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
        status: 'draft' | 'active' | 'archived'
        seo_title?: string | null
        seo_description?: string | null
        seo_keywords?: string | null
        images: string[]
        options: ProductOption[]
        variants: ProductVariant[]
    }
    updateAction: (prevState: any, formData: FormData) => Promise<{ error?: string }>
    storeSlug?: string
}

export function ProductEditForm({ product, updateAction, storeSlug }: Props) {
    const [state, formAction, pending] = useActionState(updateAction, { error: '' })
    const [brands, setBrands] = useState<{ id: string, name: string }[]>([])
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])

    // Form State
    const initialImages = product.images && product.images.length > 0
        ? product.images
        : (product.image_url ? [product.image_url] : [])

    const [images, setImages] = useState<string[]>(initialImages)
    const [options, setOptions] = useState<ProductOption[]>(product.options || [])
    const [variants, setVariants] = useState<ProductVariant[]>(product.variants || [])
    const [price, setPrice] = useState(product.price)
    const [stock, setStock] = useState(product.stock)
    const [sku, setSku] = useState(product.sku || '')

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
    const productUrl = storeSlug
        ? `http://${storeSlug}.${rootDomain}/product/${product.id}`
        : '#'

    useEffect(() => {
        // Fetch brands and categories
        fetch('/api/products/attributes')
            .then(res => res.json())
            .then(data => {
                if (data.brands) setBrands(data.brands)
                if (data.categories) setCategories(data.categories)
            })
            .catch(err => console.error('Failed to fetch attributes', err))
    }, [])

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app/products" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-white">
                    {storeSlug ? (
                        <a
                            href={productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline underline-offset-4 decoration-zinc-500"
                        >
                            {product.name}
                        </a>
                    ) : (
                        product.name
                    )}
                </h1>
            </div>

            {state.error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
                    {state.error}
                </div>
            )}

            <form action={formAction} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
                <input type="hidden" name="images" value={JSON.stringify(images)} />
                <input type="hidden" name="options" value={JSON.stringify(options)} />
                <input type="hidden" name="variants" value={JSON.stringify(variants)} />
                <input type="hidden" name="imageUrl" value={images[0] || ''} />

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">基本資訊</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label htmlFor="name">商品名稱 *</Label>
                            <Input id="name" name="name" required defaultValue={product.name} />
                        </div>
                        <div>
                            <Label htmlFor="brand">品牌</Label>
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
                            <Label htmlFor="category">分類</Label>
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
                    <h2 className="text-lg font-semibold text-white">商品圖片</h2>
                    <ProductImagesInput
                        images={images}
                        onChange={setImages}
                        maxImages={5}
                    />
                </div>

                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">價格與庫存</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="price">售價 (NTD) *</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                required
                                defaultValue={product.price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="cost">成本</Label>
                            <Input id="cost" name="cost" type="number" min="0" defaultValue={product.cost || 0} />
                        </div>
                        <div>
                            <Label htmlFor="stock">庫存數量 *</Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                min="0"
                                defaultValue={product.stock}
                                required
                                onChange={(e) => setStock(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                {/* 規格設定 */}
                <div className="space-y-4 border-t border-zinc-800 pt-6">
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

                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">狀態</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
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

                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">SEO 設定</h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="seo_title">SEO 標題</Label>
                            <Input
                                id="seo_title"
                                name="seo_title"
                                defaultValue={product.seo_title || ''}
                                placeholder="搜尋引擎顯示的標題"
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div>
                            <Label htmlFor="seo_description">SEO 描述</Label>
                            <textarea
                                id="seo_description"
                                name="seo_description"
                                defaultValue={product.seo_description || ''}
                                rows={3}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="搜尋引擎顯示的描述"
                            />
                        </div>
                        <div>
                            <Label htmlFor="seo_keywords">SEO 關鍵字</Label>
                            <Input
                                id="seo_keywords"
                                name="seo_keywords"
                                defaultValue={product.seo_keywords || ''}
                                placeholder="例如：美妝, 護膚"
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <Link href="/app/products">
                        <Button type="button" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">取消</Button>
                    </Link>
                    <Button type="submit" disabled={pending} className="bg-white text-black hover:bg-zinc-200">
                        {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        儲存變更
                    </Button>
                </div>
            </form>
        </div>
    )
}
