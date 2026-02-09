import crypto from 'crypto'
import { PaymentAdapter } from './types'

export interface ECPayCredentials {
    merchantId: string
    hashKey: string
    hashIV: string
}

export class ECPayAdapter implements PaymentAdapter {
    merchantId: string
    hashKey: string
    hashIV: string
    apiUrl: string

    /**
     * Create ECPay adapter
     * @param credentials Optional tenant-specific credentials. If not provided, uses env vars (for platform billing).
     */
    constructor(credentials?: ECPayCredentials) {
        if (credentials) {
            // Per-tenant credentials (for store checkout)
            this.merchantId = credentials.merchantId
            this.hashKey = credentials.hashKey
            this.hashIV = credentials.hashIV
        } else {
            // Global env credentials (for platform subscription billing)
            this.merchantId = process.env.ECPAY_MERCHANT_ID?.trim() || ''
            this.hashKey = process.env.ECPAY_HASH_KEY?.trim() || ''
            this.hashIV = process.env.ECPAY_HASH_IV?.trim() || ''
        }
        this.apiUrl = (process.env.ECPAY_API_URL || 'https://payment-stage.ecpay.com.tw').trim()
    }

    /**
     * Verify the signature (CheckMacValue) of the callback data
     */
    verifySignature(data: Record<string, string>): boolean {
        return this.verifyCheckMacValue(data)
    }

    // ... (calculateCheckMacValue remains unchanged) ...
    calculateCheckMacValue(params: Record<string, string>): string {
        // 1. Sort by key
        const sortedKeys = Object.keys(params).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))

        // 2. Concatenate
        let raw = `HashKey=${this.hashKey}`
        sortedKeys.forEach(key => {
            raw += `&${key}=${params[key]}`
        })
        raw += `&HashIV=${this.hashIV}`

        // 3. URL Encode (Net standard) & 4. Lowercase
        // Node's encoding might be slightly different from ECPay's .NET requirements, handling specific chars manually if needed
        let encoded = encodeURIComponent(raw).toLowerCase()

        // Fix standard JS encodeURIComponent differences for ECPay (.NET compatible)
        encoded = encoded
            .replace(/%2d/g, '-')
            .replace(/%5f/g, '_')
            .replace(/%2e/g, '.')
            .replace(/%21/g, '!')
            .replace(/%2a/g, '*')
            .replace(/%28/g, '(')
            .replace(/%29/g, ')')
            .replace(/%20/g, '+') // Critical: Spaces should be +

        // 5. SHA256
        const hash = crypto.createHash('sha256').update(encoded).digest('hex')

        // 6. Uppercase
        return hash.toUpperCase()
    }

    /**
     * Helper to format date as yyyy/MM/dd HH:mm:ss
     */
    formatDate(date: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0')
        return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }

    /**
     * 產生信用卡綁定參數
     */
    createCardBindingParams(tenantId: string, email: string, returnUrl: string, clientRedirectUrl?: string, targetPlanId?: string): Record<string, string> {
        const tradeNo = `BIND${Date.now()}`
        const tradeDate = this.formatDate(new Date())
        const memberId = tenantId.replace(/-/g, '').substring(0, 30)

        const params: Record<string, string> = {
            MerchantID: this.merchantId,
            MerchantTradeNo: tradeNo,
            MerchantTradeDate: tradeDate,
            PaymentType: 'aio',
            TotalAmount: '5',
            TradeDesc: 'Card Binding Verification',
            ItemName: 'Credit Card Binding Verification',
            ReturnURL: returnUrl,
            ChoosePayment: 'Credit',
            EncryptType: '1',
            BindingCard: '1',
            MerchantMemberID: memberId,
            CustomField2: tenantId,
            NeedExtraPaidInfo: 'Y',
            ClientBackURL: returnUrl,
        }

        if (clientRedirectUrl) params['CustomField1'] = clientRedirectUrl
        if (targetPlanId) params['CustomField3'] = targetPlanId

        params['OrderResultURL'] = returnUrl
        params['CheckMacValue'] = this.calculateCheckMacValue(params)

        return params
    }

    /**
     * 驗證 ECPay 回傳的 CheckMacValue
     */
    verifyCheckMacValue(data: Record<string, string>): boolean {
        const { CheckMacValue, ...rest } = data
        const calculated = this.calculateCheckMacValue(rest)
        return calculated === CheckMacValue
    }

    /**
     * 建立 B2C 訂單
     */
    /**
     * 模擬 2.0 授權扣款 (Token Charge)
     */
    async createTokenCharge(memberId: string, amount: number, description: string): Promise<{ success: boolean, transactionId?: string, message?: string }> {
        // In a real implementation, this would call ECPay's API (e.g., /Cashier/QueryCreditCardPeriodInfo or specific charge API)
        // Since we are simulating:
        console.log(`[ECPay Mock] Charging Member ${memberId} Amount ${amount} Desc ${description}`)

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Return success
        return {
            success: true,
            transactionId: `MOCK-CHARGE-${Date.now()}`,
            message: 'Mock Charge Success'
        }
    }

    createOrder(orderId: string, amount: number, itemName: string, returnUrl: string, clientBackUrl: string): Record<string, string> {
        // ... implementation
        const tradeDate = this.formatDate(new Date())

        const params: Record<string, string> = {
            MerchantID: this.merchantId,
            MerchantTradeNo: orderId, // Max 20 chars
            MerchantTradeDate: tradeDate,
            PaymentType: 'aio',
            TotalAmount: amount.toString(),
            TradeDesc: 'OMO Select Order',
            ItemName: itemName,
            ReturnURL: returnUrl,
            ChoosePayment: 'ALL', // Change from Credit to ALL to prevent 10200141 if Credit is disabled
            EncryptType: '1',
            ClientBackURL: clientBackUrl,
        }

        // Calc CheckMacValue
        // @ts-ignore
        params['CheckMacValue'] = this.calculateCheckMacValue(params)

        return params
    }
}

export const ecpay = new ECPayAdapter()
