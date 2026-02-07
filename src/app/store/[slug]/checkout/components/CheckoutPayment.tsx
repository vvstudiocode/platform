interface Props {
    paymentMethod: string
    setPaymentMethod: (value: string) => void
    settings: {
        payment_methods?: {
            credit_card?: boolean
            bank_transfer?: boolean
        }
    }
}

export function CheckoutPayment({ paymentMethod, setPaymentMethod, settings }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">付款方式</h2>
            <div className="space-y-3">
                {/* Bank Transfer Option */}
                {(settings.payment_methods?.bank_transfer !== false) && (
                    <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${paymentMethod === 'bank_transfer' ? 'border-rose-500 bg-rose-50' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="payment"
                                value="bank_transfer"
                                checked={paymentMethod === 'bank_transfer'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="text-rose-500"
                            />
                            <div>
                                <p className="font-medium text-gray-900">銀行轉帳 / 面交付款</p>
                                <p className="text-sm text-gray-500">訂單成立後顯示匯款資訊</p>
                            </div>
                        </div>
                    </label>
                )}

                {/* Credit Card Option */}
                {(settings.payment_methods?.credit_card !== false) && (
                    <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${paymentMethod === 'credit_card' ? 'border-rose-500 bg-rose-50' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="payment"
                                value="credit_card"
                                checked={paymentMethod === 'credit_card'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="text-rose-500"
                            />
                            <div>
                                <p className="font-medium text-gray-900">信用卡一次付清</p>
                                <p className="text-sm text-gray-500">支援 Visa, MasterCard, JCB</p>
                            </div>
                        </div>
                        <span className="text-rose-500 p-1 bg-rose-100 rounded text-xs">推薦</span>
                    </label>
                )}

                {/* Fallback */}
                {settings.payment_methods?.bank_transfer === false && settings.payment_methods?.credit_card === false && (
                    <div className="text-red-500 p-4 bg-red-50 border border-red-100 rounded-lg">
                        此商店暫未開啟任何付款方式，請聯繫店家。
                    </div>
                )}
            </div>
        </div>
    )
}
