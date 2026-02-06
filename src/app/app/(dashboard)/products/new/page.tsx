'use client'

import { useActionState } from 'react'
import { createProduct } from '../actions'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState = { error: '' }

export default function NewProductPage() {
    const [state, formAction, pending] = useActionState(createProduct, initialState)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app/products" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
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
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">基本資訊</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="sku">商品編號</Label>
                            <Input
                                id="sku"
                                name="sku"
                                placeholder="留空自動生成"
                            />
                            <p className="text-xs text-zinc-500 mt-1">格式：P000001</p>
                        </div>
                        <div>
                            <Label htmlFor="name">商品名稱 *</Label>
                            <Input id="name" name="name" required placeholder="輸入商品名稱" />
                        </div>
                        <div>
                            <Label htmlFor="brand">品牌</Label>
                            <Input id="brand" name="brand" placeholder="品牌名稱" />
                        </div>
                        <div>
                            <Label htmlFor="category">分類</Label>
                            <Input id="category" name="category" placeholder="商品分類" />
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

                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">價格與庫存</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="price">售價 (NTD) *</Label>
                            <Input id="price" name="price" type="number" min="0" required placeholder="0" />
                        </div>
                        <div>
                            <Label htmlFor="cost">成本</Label>
                            <Input id="cost" name="cost" type="number" min="0" placeholder="0" />
                        </div>
                        <div>
                            <Label htmlFor="stock">庫存數量 *</Label>
                            <Input id="stock" name="stock" type="number" min="0" defaultValue="0" required />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <h2 className="text-lg font-semibold text-white">圖片與狀態</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label htmlFor="image_url">商品圖片網址</Label>
                            <Input id="image_url" name="image_url" type="url" placeholder="https://..." />
                        </div>
                        <div>
                            <Label htmlFor="status">狀態</Label>
                            <select
                                id="status"
                                name="status"
                                defaultValue="draft"
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
                    <Link href="/app/products">
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
