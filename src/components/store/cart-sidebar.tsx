'use client'

import { useCart } from '@/lib/cart-context'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

interface Props {
    isOpen: boolean
    onClose: () => void
    storeSlug: string
}

export function CartSidebar({ isOpen, onClose, storeSlug }: Props) {
    const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCart()

    if (!isOpen) return null

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">購物車</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ShoppingBag className="h-16 w-16 mb-4" />
                            <p>購物車是空的</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <div key={`${item.productId}_${idx}`} className="flex gap-4 bg-gray-50 rounded-lg p-3">
                                    {/* Image */}
                                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                無圖片
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                                        {item.options && Object.keys(item.options).length > 0 && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                            </p>
                                        )}
                                        <p className="text-rose-500 font-bold mt-1">
                                            NT$ {item.price.toLocaleString()}
                                        </p>

                                        {/* Quantity */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.options)}
                                                className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.options)}
                                                disabled={item.quantity >= item.maxStock}
                                                className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => removeItem(item.productId, item.options)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded ml-auto"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t p-4 space-y-4">
                        <div className="flex justify-between text-lg font-bold">
                            <span>小計</span>
                            <span>NT$ {getSubtotal().toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={clearCart}
                                className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                清空購物車
                            </button>
                            <Link
                                href={`/store/${storeSlug}/checkout`}
                                onClick={onClose}
                                className="flex-1 py-3 bg-rose-500 text-white rounded-lg text-center font-medium hover:bg-rose-600"
                            >
                                前往結帳
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
