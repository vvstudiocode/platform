'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Package, Edit, GripVertical, Loader2 } from 'lucide-react'
import { AppProductDeleteButton } from './product-delete-button'
import { updateProductStatus, updateProductOrder } from './actions'

interface Product {
    id: string
    sku: string | null
    name: string
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
}

export function ProductListClient({ initialProducts }: Props) {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [updating, setUpdating] = useState<string | null>(null)

    // 計算利潤
    const getProfit = (price: number, cost: number) => {
        if (!cost || cost === 0) return null
        return price - cost
    }

    // 切換上下架狀態
    const toggleStatus = async (productId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'draft' : 'active'
        setUpdating(productId)

        const result = await updateProductStatus(productId, newStatus)

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
            await updateProductOrder(orderData)
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
                                                <Link href={`/app/products/${product.id}`}>
                                                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <AppProductDeleteButton productId={product.id} productName={product.name} />
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
