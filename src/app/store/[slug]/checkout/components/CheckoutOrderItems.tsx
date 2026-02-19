'use client'

import { CartItem, useCart } from '@/lib/cart-context'
import { Minus, Plus } from 'lucide-react'

interface Props {
    items: CartItem[]
}

export function CheckoutOrderItems({ items }: Props) {
    const { updateQuantity } = useCart()

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">訂單商品</h2>
            <div className="divide-y">
                {items.map((item, idx) => (
                    <div key={idx} className="py-4 flex justify-between items-center">
                        <div className="flex-1 min-w-0 pr-4">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            {item.options && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                </p>
                            )}
                            <div className="mt-3 flex items-center">
                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId, item.options)}
                                        className="p-1 hover:bg-gray-100 text-gray-500 transition-colors"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-4 text-center text-xs font-medium text-gray-700">{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId, item.options)}
                                        className="p-1 hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"
                                        disabled={item.quantity >= item.maxStock}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-900">
                                NT$ {(item.price * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                NT$ {item.price.toLocaleString()} / 件
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
