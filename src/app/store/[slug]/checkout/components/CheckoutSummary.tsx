interface Props {
    subtotal: number
    shippingFee: number
    total: number
}

export function CheckoutSummary({ subtotal, shippingFee, total }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">訂單摘要</h2>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>商品小計</span>
                    <span>NT$ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>運費</span>
                    <span>{shippingFee === 0 ? '免運' : `NT$ ${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>總計</span>
                    <span className="text-rose-500">NT$ {total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
}
