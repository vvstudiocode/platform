import { MapPin } from 'lucide-react'

interface ShippingOption {
    id: string
    label: string
    description: string
}

interface Props {
    shippingMethod: string
    setShippingMethod: (value: string) => void
    storeName: string
    setStoreName: (value: string) => void
    storeCode: string
    setStoreCode: (value: string) => void
    storeAddress: string
    setStoreAddress: (value: string) => void
    shippingOptions: ShippingOption[]
    shippingFees: Record<string, number>
}

export function CheckoutShipping({
    shippingMethod,
    setShippingMethod,
    storeName,
    setStoreName,
    storeCode,
    setStoreCode,
    storeAddress,
    setStoreAddress,
    shippingOptions,
    shippingFees,
}: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">配送方式</h2>
            <div className="space-y-3">
                {shippingOptions.map((option) => (
                    <label
                        key={option.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${shippingMethod === option.id
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="shipping"
                                value={option.id}
                                checked={shippingMethod === option.id}
                                onChange={(e) => setShippingMethod(e.target.value)}
                                className="text-rose-500"
                            />
                            <div>
                                <p className="font-medium text-gray-900">{option.label}</p>
                                <p className="text-sm text-gray-500">{option.description}</p>
                            </div>
                        </div>
                        <span className="font-medium text-gray-900">
                            {shippingFees[option.id] === 0 ? '免運' : `NT$ ${shippingFees[option.id]}`}
                        </span>
                    </label>
                ))}
            </div>

            {/* 7-11 Details */}
            {shippingMethod === '711' && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            門市名稱 *
                        </label>
                        <input
                            type="text"
                            required
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            placeholder="例：信義門市"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            門市店號 *
                        </label>
                        <input
                            type="text"
                            required
                            value={storeCode}
                            onChange={(e) => setStoreCode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            placeholder="例：123456"
                        />
                    </div>
                </div>
            )}

            {/* Home Delivery Address */}
            {shippingMethod === 'home' && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        配送地址 *
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                            required
                            value={storeAddress}
                            onChange={(e) => setStoreAddress(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            rows={2}
                            placeholder="請輸入完整配送地址"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
