import { CartItem } from '@/lib/cart-context'

interface Props {
    items: CartItem[]
}

export function CheckoutOrderItems({ items }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">訂單商品</h2>
            <div className="divide-y">
                {items.map((item, idx) => (
                    <div key={idx} className="py-3 flex justify-between">
                        <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.options && (
                                <p className="text-sm text-gray-500">
                                    {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                </p>
                            )}
                            <p className="text-sm text-gray-500">× {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900">
                            NT$ {(item.price * item.quantity).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
