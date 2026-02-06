'use client'

import { useActionState, useState, useEffect } from 'react'
import { createProduct, generateSKU } from '../actions'
import { ArrowLeft, Loader2, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'

const initialState = { error: '' }

export default function NewProductPage() {
    const [state, formAction, pending] = useActionState(createProduct, initialState)
    const [sku, setSku] = useState('')
    const [price, setPrice] = useState('')
    const [cost, setCost] = useState('')
    const [generatingSku, setGeneratingSku] = useState(false)
    const [brands, setBrands] = useState<{ id: string, name: string }[]>([])
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])

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

    // 計算利潤
    const profit = price && cost ? Number(price) - Number(cost) : null

    // 自動生成 SKU
    const handleGenerateSku = async () => {
        setGeneratingSku(true)
        const newSku = await generateSKU()
        setSku(newSku)
        setGeneratingSku(false)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-white">新增商品</h1>
            </div>

            {state.error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
                    {state.error}
                </div>
            )}

            <form action={formAction} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-6">
                {/* 基本資訊 */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">基本資訊</h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="sku">商品編號</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="sku"
                                    name="sku"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="留空自動生成"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleGenerateSku}
                                    disabled={generatingSku}
                                >
                                    {generatingSku ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Wand2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">格式：P000001</p>
                        </div>
                        <div>
                            <Label htmlFor="name">商品名稱 *</Label>
                            <Input id="name" name="name" required placeholder="輸入商品名稱" />
                        </div>
                        <div>
                            <Label htmlFor="brand">品牌</Label>
                            <Combobox
                                name="brand"
                                options={brands.map(b => ({ value: b.name, label: b.name }))}
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
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="商品描述..."
                            />
                        </div>
                    </div>
                </div>

                {/* 價格與庫存 */}
                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">價格與庫存</h2>

                    <div className="grid gap-4 sm:grid-cols-4">
                        <div>
                            <Label htmlFor="price">售價 (NTD) *</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                required
                                placeholder="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="cost">成本</Label>
                            <Input
                                id="cost"
                                name="cost"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>利潤</Label>
                            <div className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                                {profit !== null ? (
                                    <span className={profit > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                        {profit > 0 ? '+' : ''}{profit.toLocaleString()}
                                    </span>
                                ) : (
                                    <span className="text-zinc-500">-</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="price_krw">韓幣價格</Label>
                            <Input id="price_krw" name="price_krw" type="number" min="0" placeholder="0" />
                        </div>
                        <div>
                            <Label htmlFor="stock">庫存數量 *</Label>
                            <Input id="stock" name="stock" type="number" min="0" defaultValue="0" required />
                        </div>
                    </div>
                </div>

                {/* 圖片與狀態 */}
                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">圖片與狀態</h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label htmlFor="image_url">商品圖片網址</Label>
                            <Input id="image_url" name="image_url" type="url" placeholder="https://..." />
                            <p className="text-xs text-zinc-500 mt-1">建立商品後可以上傳圖片</p>
                        </div>
                        <div>
                            <Label htmlFor="status">狀態</Label>
                            <select
                                id="status"
                                name="status"
                                defaultValue="draft"
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="draft">草稿（下架）</option>
                                <option value="active">上架</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* SEO 設定 */}
                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">SEO 設定</h2>
                    <p className="text-sm text-zinc-500">設定搜尋引擎優化資訊，提高商品曝光率</p>

                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="seo_title">SEO 標題</Label>
                            <Input id="seo_title" name="seo_title" placeholder="搜尋引擎顯示的標題（留空使用商品名稱）" />
                        </div>
                        <div>
                            <Label htmlFor="seo_description">SEO 描述</Label>
                            <textarea
                                id="seo_description"
                                name="seo_description"
                                rows={3}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="搜尋引擎顯示的描述（留空使用商品描述）"
                            />
                        </div>
                        <div>
                            <Label htmlFor="seo_keywords">SEO 關鍵字</Label>
                            <Input id="seo_keywords" name="seo_keywords" placeholder="以逗號分隔關鍵字，例：美妝, 護膚, 韓國" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <Link href="/admin/products">
                        <Button type="button" variant="outline">取消</Button>
                    </Link>
                    <Button type="submit" disabled={pending}>
                        {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        建立商品
                    </Button>
                </div>
            </form>
        </div>
    )
}
