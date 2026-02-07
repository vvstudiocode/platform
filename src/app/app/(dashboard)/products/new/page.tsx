'use client'

import { useActionState, useState, useEffect } from 'react'
import { createProduct } from '../actions'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductImagesInput, ImageItem } from '@/components/admin/product-images-input'
import { ProductVariantsEditor, ProductOption, ProductVariant } from '@/components/admin/product-variants-editor'
import { Combobox } from '@/components/ui/combobox'

const initialState = { error: '' }

export default function NewProductPage() {
    const [state, formAction, pending] = useActionState(createProduct, initialState)

    // Form State
    const [brands, setBrands] = useState<{ id: string, name: string }[]>([])
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])

    // New State
    // const [images, setImages] = useState<string[]>([]) // Old
    const [imageItems, setImageItems] = useState<ImageItem[]>([])

    const [options, setOptions] = useState<ProductOption[]>([])
    const [variants, setVariants] = useState<ProductVariant[]>([])
    const [price, setPrice] = useState('0')
    const [stock, setStock] = useState('0')
    const [sku, setSku] = useState('')

    useEffect(() => {
        fetch('/api/products/attributes')
            .then(res => res.json())
            .then(data => {
                if (data.brands) setBrands(data.brands)
                if (data.categories) setCategories(data.categories)
            })
            .catch(console.error)
    }, [])

    const handleSubmit = async (formData: FormData) => {
        // Prepare image data
        const imageOrder: string[] = []

        imageItems.forEach((item, index) => {
            if (item.type === 'url') {
                imageOrder.push(item.url)
            } else {
                // New file
                imageOrder.push(`new_file_${index}`)
                formData.append(`new_file_${index}`, item.file)
            }
        })

        formData.append('image_order', JSON.stringify(imageOrder))
        // New product has no deleted images initially

        // Also stringify other complex data
        formData.set('options', JSON.stringify(options))
        formData.set('variants', JSON.stringify(variants))

        // Call server action
        return formAction(formData)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app/products" className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-serif font-bold text-foreground">新增商品</h1>
            </div>

            {state.error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4">
                    {state.error}
                </div>
            )}

            <form action={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-8 shadow-soft">

                <div className="space-y-4">
                    <h2 className="text-lg font-serif font-semibold text-foreground border-b border-border pb-2">基本資訊</h2>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label htmlFor="name">商品名稱 *</Label>
                            <Input id="name" name="name" required placeholder="輸入商品名稱" className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="brand">品牌</Label>
                            <div className="mt-1.5">
                                <Combobox
                                    name="brand"
                                    options={brands.map(b => ({ value: b.name, label: b.name }))}
                                    placeholder="選擇或輸入品牌"
                                    searchPlaceholder="搜尋品牌..."
                                    allowCustom
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="category">分類</Label>
                            <div className="mt-1.5">
                                <Combobox
                                    name="category"
                                    options={categories.map(c => ({ value: c.name, label: c.name }))}
                                    placeholder="選擇或輸入分類"
                                    searchPlaceholder="搜尋分類..."
                                    allowCustom
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="description">商品描述</Label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                className="w-full mt-1.5 px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="商品描述..."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-serif font-semibold text-foreground border-b border-border pb-2">商品圖片</h2>
                    <ProductImagesInput
                        items={imageItems}
                        onChange={setImageItems}
                        maxImages={5}
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-serif font-semibold text-foreground border-b border-border pb-2">價格與庫存</h2>
                    <div className="grid gap-6 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="price">售價 (NTD) *</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="cost">成本</Label>
                            <Input id="cost" name="cost" type="number" min="0" placeholder="0" className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="stock">庫存數量 *</Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                min="0"
                                required
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="price_krw">韓幣價格</Label>
                            <Input id="price_krw" name="price_krw" type="number" min="0" placeholder="0" className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="sku">SKU 編號</Label>
                            <Input
                                id="sku"
                                name="sku"
                                placeholder="留空自動生成"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                className="mt-1.5"
                            />
                        </div>
                    </div>
                </div>

                {/* 規格設定 */}
                <div className="space-y-4">
                    <h2 className="text-lg font-serif font-semibold text-foreground border-b border-border pb-2">規格設定</h2>
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

                <div className="space-y-4">
                    <h2 className="text-lg font-serif font-semibold text-foreground border-b border-border pb-2">狀態設定</h2>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="status">狀態</Label>
                            <select
                                id="status"
                                name="status"
                                defaultValue="draft"
                                className="w-full mt-1.5 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                    <h2 className="text-lg font-serif font-semibold text-foreground border-b border-border pb-2">SEO 設定</h2>
                    <div className="grid gap-6">
                        <div>
                            <Label htmlFor="seo_title">SEO 標題</Label>
                            <Input id="seo_title" name="seo_title" placeholder="搜尋引擎顯示的標題" className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="seo_description">SEO 描述</Label>
                            <textarea
                                id="seo_description"
                                name="seo_description"
                                rows={3}
                                className="w-full mt-1.5 px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="搜尋引擎顯示的描述"
                            />
                        </div>
                        <div>
                            <Label htmlFor="seo_keywords">SEO 關鍵字</Label>
                            <Input id="seo_keywords" name="seo_keywords" placeholder="例如：美妝, 護膚" className="mt-1.5" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                    <Link href="/app/products">
                        <Button type="button" variant="outline">取消</Button>
                    </Link>
                    <Button type="submit" disabled={pending} className="bg-foreground text-background hover:bg-foreground/90 shadow-soft">
                        {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        建立商品
                    </Button>
                </div>
            </form>
        </div>
    )
}
