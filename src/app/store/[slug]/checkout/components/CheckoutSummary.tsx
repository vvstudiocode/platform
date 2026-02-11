interface Props {
    subtotal: number
    shippingFee: number
    shippingDiscount?: number
    total: number
}

export function CheckoutSummary({ subtotal, shippingFee, shippingDiscount = 0, total }: Props) {
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
                    <span>NT$ {shippingFee.toLocaleString()}</span>
                </div>
                {shippingDiscount > 0 && (
                    <div className="flex justify-between text-rose-500 font-medium">
                        <span>運費折抵</span>
                        <span>- NT$ {shippingDiscount.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>總計</span>
                    <span className="text-rose-500">NT$ {total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
}
