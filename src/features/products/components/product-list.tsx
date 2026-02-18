'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Edit, GripVertical, Loader2, Link2, Check } from 'lucide-react'
import { DeleteButton } from '@/components/ui/delete-button'

interface Product {
    id: string
    sku: string | null
    keyword: string | null
    name: string
    description: string | null
    brand: string | null
    category: string | null
    price: number
    cost: number
    stock: number
    image_url: string | null
    status: 'draft' | 'active' | 'archived'
    sort_order: number
}

interface Props {
    initialProducts: Product[]
    lineBasicId: string | null
    basePath: string // '/admin/products' or '/app/products'
    deleteAction: (id: string) => Promise<{ error?: string; success?: boolean }>
    updateStatusAction: (id: string, status: string) => Promise<{ error?: string; success?: boolean }>
    updateOrderAction: (items: { id: string; order: number }[]) => Promise<{ error?: string; success?: boolean }>
}

export function ProductList({ initialProducts, lineBasicId, basePath, deleteAction, updateStatusAction, updateOrderAction }: Props) {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [updating, setUpdating] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const copyLineLink = (productId: string, sku: string | null, keyword: string | null) => {
        if (!lineBasicId) {
            alert('請先在 LINE 設定中填寫「官方帳號 ID」')
            return
        }
        
        // 優先使用自訂編號 (Keyword)，若無則使用 SKU
        const identifier = keyword || sku
        
        if (!identifier) {
            alert('該商品尚未設定編號，無法產生喊單連結')
            return
        }

        // 取得當前網址
        const origin = window.location.origin
        // 從 basePath 提取 site slug (/app/products -> 'app' or /admin/products -> 'admin')
        // 但實際上在中轉頁面，site 應該是商店的 slug
        // 我們先簡單從 basePath 取得第一層 (通常是 admin 或 app)
        const parts = basePath.split('/')
        const site = parts[1] || 'app'

        // 產生中轉頁面連結 (這會讓 LINE 抓取預覽圖)
        const link = `${origin}/${site}/line-order/${productId}`
        
        navigator.clipboard.writeText(link)
        setCopiedId(identifier)
        setTimeout(() => setCopiedId(null), 2000)
    }

    // 計算利潤
    const getProfit = (price: number, cost: number) => {
        if (!cost || cost === 0) return null
        return price - cost
    }

    // 切換上下架狀態
    const toggleStatus = async (productId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'draft' : 'active'
        setUpdating(productId)

        const result = await updateStatusAction(productId, newStatus)

        if (!result.error) {
            setProducts(products.map(p =>
                p.id === productId ? { ...p, status: newStatus as any } : p
            ))
        }
        setUpdating(null)
    }

    // 拖拉開始
    const handleDragStart = (index: number) => {
        setDragIndex(index)
    }

    // 拖拉到目標
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (dragIndex !== null && dragIndex !== index) {
            const newProducts = [...products]
            const [moved] = newProducts.splice(dragIndex, 1)
            newProducts.splice(index, 0, moved)
            setProducts(newProducts)
            setDragIndex(index)
        }
    }

    // 拖拉結束
    const handleDragEnd = async () => {
        if (dragIndex !== null) {
            // 儲存新順序
            const orderData = products.map((p, i) => ({ id: p.id, order: i }))
            await updateOrderAction(orderData)
        }
        setDragIndex(null)
    }

    const statusLabels: Record<string, string> = {
        active: '上架中',
        draft: '已下架',
        archived: '已刪除',
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead className="bg-muted/30">
                        <tr className="border-b border-border text-left">
                            <th className="w-10 px-4 py-4"></th>
                            <th className="px-4 py-4 text-xs font-serif font-semibold text-muted-foreground">編號</th>
                            <th className="px-4 py-4 text-xs font-serif font-semibold text-muted-foreground">圖片</th>
                            <th className="px-4 py-4 text-xs font-serif font-semibold text-muted-foreground">名稱</th>
                            <th className="px-4 py-4 text-xs font-serif font-semibold text-muted-foreground">售價</th>
                            <th className="px-4 py-4 text-xs font-serif font-semibold text-muted-foreground">利潤</th>
                            <th className="px-4 py-4 text-xs font-serif font-semibold text-muted-foreground">成本</th>
                            <th className="px-4 py-4 text-xs font-serif font-semibold text-muted-foreground">庫存</th>
                            <th className="px-4 py-4 text-xs font-serif font-semibold text-muted-foreground">狀態</th>
                            <th className="px-4 py-4 text-xs font-serif font-semibold text-muted-foreground text-right w-[100px]">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {products.length > 0 ? (
                            products.map((product, index) => {
                                const profit = getProfit(product.price, product.cost)
                                const isDragging = dragIndex === index

                                return (
                                    <tr
                                        key={product.id}
                                        className={`group transition-all ${isDragging ? 'bg-accent/5 opacity-50' : 'hover:bg-accent/5'}`}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <td className="px-4 py-4">
                                            <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors">
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <span className="text-muted-foreground font-mono text-xs">
                                                {product.sku || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="w-12 h-12 bg-muted rounded-md border border-border overflow-hidden shrink-0">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-accent/5">
                                                        <Package className="h-5 w-5 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-medium text-sm text-foreground group-hover:text-accent transition-colors">{product.name}</p>
                                                {product.brand && (
                                                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <span className="text-sm font-medium text-foreground">
                                                NT$ {Number(product.price).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            {profit !== null ? (
                                                <span className={`text-sm font-medium ${profit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {profit > 0 ? '+' : ''}{profit.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <span className="text-sm text-muted-foreground">
                                                {product.cost ? `NT$ ${Number(product.cost).toLocaleString()}` : '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-amber-600' : 'text-foreground'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <button
                                                onClick={() => toggleStatus(product.id, product.status)}
                                                disabled={updating === product.id}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${product.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                                                    }`}
                                            >
                                                {updating === product.id ? (
                                                    <Loader2 className="absolute left-1/2 -translate-x-1/2 h-3 w-3 text-white animate-spin" />
                                                ) : (
                                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${product.status === 'active' ? 'translate-x-4.5' : 'translate-x-0.5'
                                                        }`} />
                                                )}
                                            </button>
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                {statusLabels[product.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right align-top">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => copyLineLink(product.id, product.sku, product.keyword)}
                                                    title="複製 LINE 喊單連結"
                                                    className={`h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors ${copiedId === (product.keyword || product.sku)
                                                            ? 'text-emerald-500 bg-emerald-500/10'
                                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                                                        }`}
                                                >
                                                    {copiedId === (product.keyword || product.sku) ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                                                </button>
                                                <Link href={`${basePath}/${product.id}`}>
                                                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <DeleteButton
                                                    itemId={product.id}
                                                    itemName={product.name}
                                                    onDelete={deleteAction}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>尚無商品，點擊右上角「新增商品」開始建立</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
