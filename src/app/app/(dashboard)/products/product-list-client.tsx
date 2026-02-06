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
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="w-10 px-2"></th>
                            <th className="text-left px-4 py-4 text-sm font-medium text-zinc-400">編號</th>
                            <th className="text-left px-4 py-4 text-sm font-medium text-zinc-400">圖片</th>
                            <th className="text-left px-4 py-4 text-sm font-medium text-zinc-400">名稱</th>
                            <th className="text-left px-4 py-4 text-sm font-medium text-zinc-400">售價</th>
                            <th className="text-left px-4 py-4 text-sm font-medium text-zinc-400">利潤</th>
                            <th className="text-left px-4 py-4 text-sm font-medium text-zinc-400">成本</th>
                            <th className="text-left px-4 py-4 text-sm font-medium text-zinc-400">庫存</th>
                            <th className="text-left px-4 py-4 text-sm font-medium text-zinc-400">狀態</th>
                            <th className="text-right px-4 py-4 text-sm font-medium text-zinc-400">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product, index) => {
                                const profit = getProfit(product.price, product.cost)
                                return (
                                    <tr
                                        key={product.id}
                                        className={`border-b border-zinc-800 hover:bg-zinc-800/50 ${dragIndex === index ? 'bg-zinc-800' : ''
                                            }`}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <td className="px-2">
                                            <div className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300">
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            <span className="text-zinc-400 font-mono text-xs md:text-sm">
                                                {product.sku || '-'}
                                            </span>
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-800 rounded-lg overflow-hidden">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-3 w-3 md:h-4 md:w-4 text-zinc-600" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            <p className="font-medium text-white text-xs md:text-sm">{product.name}</p>
                                            {product.brand && (
                                                <p className="text-[10px] md:text-xs text-zinc-500">{product.brand}</p>
                                            )}
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            <span className="text-white text-xs md:text-sm">
                                                {Number(product.price).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            {profit !== null ? (
                                                <span className={`${profit > 0 ? 'text-emerald-400' : 'text-red-400'} text-xs md:text-sm`}>
                                                    {profit > 0 ? '+' : ''}{profit.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            <span className="text-zinc-400 text-xs md:text-sm">
                                                {product.cost ? Number(product.cost).toLocaleString() : '-'}
                                            </span>
                                        </td>
                                        <td className="px-2 md:px-4 py-3">
                                            <span className={`${product.stock <= 5 ? 'text-amber-400' : 'text-white'} text-xs md:text-sm`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleStatus(product.id, product.status)}
                                                disabled={updating === product.id}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${product.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-600'
                                                    }`}
                                            >
                                                {updating === product.id ? (
                                                    <Loader2 className="absolute left-1/2 -translate-x-1/2 h-3 w-3 text-white animate-spin" />
                                                ) : (
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${product.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                                        }`} />
                                                )}
                                            </button>
                                            <span className="ml-2 text-xs text-zinc-400">
                                                {statusLabels[product.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/app/products/${product.id}`}>
                                                    <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg">
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
                                <td colSpan={10} className="px-6 py-12 text-center text-zinc-500">
                                    尚無商品，點擊右上角「新增商品」開始建立
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
