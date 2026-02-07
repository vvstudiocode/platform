'use client'

import { useActionState, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
        price_krw: number | null
        stock: number
        sku: string | null
        image_url: string | null
        status: string
        images: string[]
        options: ProductOption[]
        variants: ProductVariant[]
    }
    updateAction: (prevState: any, formData: FormData) => Promise<{ error?: string }>
}

export function ProductEditForm({ product, updateAction }: Props) {
    const [state, formAction, pending] = useActionState(updateAction, { error: '' })

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
        const currentUrls = new Set(newImages.filter(i => i.type === 'url').map(i => i.url))
        const removedUrls = images
            .filter(i => i.type === 'url' && !currentUrls.has(i.url))
            .map(i => (i as any).url)

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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-white">編輯商品</h1>
            </div>

            {state.error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
                    {state.error}
                </div>
            )}

            <form action={handleSubmit} className="space-y-6">

                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
                    {/* 基本資訊 */}
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
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 圖片管理 */}
                    <div className="space-y-4 border-t border-zinc-800 pt-6">
                        <h2 className="text-lg font-semibold text-white">商品圖片</h2>
                        <ProductImagesInput
                            items={images}
                            onChange={handleImagesChange}
                            maxImages={5}
                        />
                    </div>

                    {/* 價格與庫存 */}
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
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="cost">成本</Label>
                                <Input id="cost" name="cost" type="number" min="0" defaultValue={product.cost || 0} />
                            </div>
                            <div>
                                <Label htmlFor="price_krw">韓幣價格</Label>
                                <Input id="price_krw" name="price_krw" type="number" min="0" defaultValue={product.price_krw || 0} />
                            </div>
                            <div>
                                <Label htmlFor="stock">基本庫存 *</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    value={stock}
                                    onChange={(e) => setStock(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    name="sku"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
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

                    {/* 狀態 */}
                    <div className="space-y-4 border-t border-zinc-800 pt-6">
                        <h2 className="text-lg font-semibold text-white">狀態</h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="status">狀態</Label>
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
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <Link href="/admin/products">
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
