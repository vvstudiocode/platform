'use client'

import { useCart } from '@/lib/cart-context'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export function CartPopover() {
    const { items, updateQuantity, removeItem, getCartTotal, clearCart, isCartOpen, setIsCartOpen, storeSlug } = useCart()
    const ref = useRef<HTMLDivElement>(null)

    // Handle click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                // If the click target is the cart toggle button (which might be outside this popover), we should handle that in the parent
                // But generally clicking outside closes it.
                // We'll rely on the parent or a transparent overlay if needed, 
                // but standard popover behavior is click outside closes.
                // Since this is absolutely positioned inside the header, we might need a global listener.
                setIsCartOpen(false)
            }
        }

        if (isCartOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isCartOpen, setIsCartOpen])

    if (!isCartOpen) return null

    return (
        <div
            ref={ref}
            className="fixed top-20 right-4 md:right-8 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] transform transition-all duration-200 ease-out origin-top-right animate-in fade-in zoom-in-95"
        >
            {/* Triangle Arrow - adjusted for fixed position relative to icon roughly */}
            <div className="hidden md:block absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45" />

            {/* Header */}
            <div className="relative p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">購物車 ({items.length})</h3>
                <div className="flex items-center gap-3">

                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Items */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <ShoppingBag className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-sm">您的購物車是空的</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {items.map((item, idx) => (
                            <div key={`${item.productId}_${idx}`} className="relative flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                {/* Image */}
                                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                                            無圖片
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                    <div>
                                        <h4 className="font-medium text-gray-900 text-sm truncate pr-4">{item.name}</h4>
                                        {item.options && Object.keys(item.options).length > 0 && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {Object.entries(item.options).map(([k, v]) => `${v}`).join(', ')}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-rose-500 font-bold text-sm">
                                            NT${item.price.toLocaleString()}
                                        </p>

                                        {/* Controls */}
                                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId, item.options)}
                                                className="p-1 hover:bg-gray-100 text-gray-500"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-4 text-center text-xs font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId, item.options)}
                                                disabled={item.quantity >= item.maxStock}
                                                className="p-1 hover:bg-gray-100 text-gray-500 disabled:opacity-30"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">總計</span>
                        <span className="text-lg font-bold text-gray-900">NT$ {getCartTotal().toLocaleString()}</span>
                    </div>
                    <Link
                        href={`/store/${storeSlug}/checkout`}
                        onClick={() => setIsCartOpen(false)}
                        className="block w-full py-2.5 bg-gray-900 hover:bg-black text-white text-center rounded-lg font-medium text-sm transition-colors shadow-lg shadow-gray-200"
                    >
                        前往結帳
                    </Link>
                </div>
            )}
        </div>
    )
}
