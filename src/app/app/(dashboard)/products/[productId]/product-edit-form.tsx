'use client'

import { useActionState, useState, useEffect } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { ProductImagesInput, ImageItem } from '@/components/admin/product-images-input'
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
        keyword: string | null
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

    // State for Images & Variants
    // Handle initial images: if generic 'images' array is empty but legacy 'image_url' exists, use it.
    const initialImagesStrings = product.images && product.images.length > 0
        ? product.images
        : (product.image_url ? [product.image_url] : [])

    const initialImageItems: ImageItem[] = initialImagesStrings.map(url => ({
        type: 'url',
        id: url, // Use URL as ID for existing images
        url: url
    }))

    const [images, setImages] = useState<ImageItem[]>(initialImageItems)
    const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([])

    const [options, setOptions] = useState<ProductOption[]>(product.options || [])
    const [variants, setVariants] = useState<ProductVariant[]>(product.variants || [])
    const [price, setPrice] = useState(product.price)
    const [stock, setStock] = useState(product.stock)
    const [sku, setSku] = useState(product.sku || '')

    const handleImagesChange = (newImages: ImageItem[]) => {
        // Find if any URL items were removed
        const newUrlItems = newImages.filter(i => i.type === 'url') as { type: 'url', id: string, url: string }[]
        const currentUrls = new Set(newUrlItems.map(i => i.url))

        const removedUrls = images
            .filter(i => i.type === 'url')
            .map(i => (i as { type: 'url', url: string }).url)
            .filter(url => !currentUrls.has(url))

        if (removedUrls.length > 0) {
            setDeletedImageUrls(prev => [...prev, ...removedUrls])
        }

        setImages(newImages)
    }

    const handleSubmit = async (formData: FormData) => {
        // Prepare image data
        const imageOrder: string[] = []

        images.forEach((item, index) => {
            if (item.type === 'url') {
                imageOrder.push(item.url)
            } else {
                // New file
                imageOrder.push(`new_file_${index}`)
                formData.append(`new_file_${index}`, item.file)
            }
        })

        formData.append('image_order', JSON.stringify(imageOrder))
        formData.append('deleted_images', JSON.stringify(deletedImageUrls))

        // Also stringify other complex data
        formData.set('options', JSON.stringify(options))
        formData.set('variants', JSON.stringify(variants))

        // Call server action
        return formAction(formData)
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
    const productUrl = storeSlug
        ? `http://${storeSlug}.${rootDomain}/product/${product.id}`
        : '#'

    useEffect(() => {
        // Fetch brands and categories
        fetch('/api/products/attributes')
            .then(res => res.json())
            .then(data => {
                if (data.brands) {
                    // Deduplicate brands just in case
                    const uniqueBrands = Array.from(new Map(data.brands.map((b: any) => [b.name, b])).values()) as { id: string, name: string }[]
                    setBrands(uniqueBrands)
                }
                if (data.categories) {
                    // Deduplicate categories
                    const uniqueCategories = Array.from(new Map(data.categories.map((c: any) => [c.name, c])).values()) as { id: string, name: string }[]
                    setCategories(uniqueCategories)
                }
            })
            .catch(err => console.error('Failed to fetch attributes', err))
    }, [])

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app/products" className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-foreground">
                    {storeSlug ? (
                        <a
                            href={productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline underline-offset-4 decoration-muted-foreground"
                        >
                            {product.name}
                        </a>
                    ) : (
                        product.name
                    )}
                </h1>
            </div>

            {state.error && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive rounded-lg p-4">
                    {state.error}
                </div>
            )}

            <form action={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-6 shadow-sm">

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">基本資訊</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">ID: {product.id}</span>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label htmlFor="name">商品名稱 *</Label>
                            <Input id="name" name="name" required defaultValue={product.name} />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="keyword" className="flex items-center gap-2">
                                LINE 喊單編號 (Keyword)
                                <span className="text-[10px] font-normal text-muted-foreground bg-accent/10 px-1.5 py-0.5 rounded">自訂編號</span>
                            </Label>
                            <Input
                                id="keyword"
                                name="keyword"
                                defaultValue={product.keyword || ''}
                                placeholder="例如：A01, B2 (客人輸入此編號 +1 即可下單)"
                                className="border-accent/30 focus:ring-accent"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">
                                若未設定，系統預設使用商品 SKU (目前為: <code>{product.sku || '無'}</code>)。
                            </p>
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
                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t border-border pt-6">
                    <h2 className="text-lg font-semibold text-foreground">商品圖片</h2>
                    <ProductImagesInput
                        items={images}
                        onChange={handleImagesChange}
                        maxImages={5}
                    />
                </div>

                <div className="space-y-4 border-t border-border pt-6">
                    <h2 className="text-lg font-semibold text-foreground">價格與庫存</h2>
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
                <div className="space-y-4 border-t border-border pt-6">
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

                <div className="space-y-4 border-t border-border pt-6">
                    <h2 className="text-lg font-semibold text-foreground">狀態</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="status">狀態</Label>
                            <select
                                id="status"
                                name="status"
                                defaultValue={product.status}
                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="draft">草稿</option>
                                <option value="active">上架</option>
                                <option value="archived">下架</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t border-border pt-6">
                    <h2 className="text-lg font-semibold text-foreground">SEO 設定</h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="seo_title">SEO 標題</Label>
                            <Input
                                id="seo_title"
                                name="seo_title"
                                defaultValue={product.seo_title || ''}
                                placeholder="搜尋引擎顯示的標題"
                                className="bg-background border-input text-foreground"
                            />
                        </div>
                        <div>
                            <Label htmlFor="seo_description">SEO 描述</Label>
                            <textarea
                                id="seo_description"
                                name="seo_description"
                                defaultValue={product.seo_description || ''}
                                rows={3}
                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                                className="bg-background border-input text-foreground"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Link href="/app/products">
                        <Button type="button" variant="outline" className="border-border text-muted-foreground hover:text-foreground">取消</Button>
                    </Link>
                    <Button type="submit" disabled={pending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        儲存變更
                    </Button>
                </div>
            </form>
        </div>
    )
}
