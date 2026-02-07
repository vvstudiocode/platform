// Tenant 相關類型定義

export interface TenantContext {
    id: string
    name: string
    slug: string
    isHQ: boolean
    settings: TenantSettings | null
    plan_id?: string
    ecpay_card_id?: string | null
    next_billing_at?: string | null
    storage_usage_mb?: number
    subscription_status?: string
}

export interface TenantSettings {
    storeName?: string
    description?: string
    logoUrl?: string
    phone?: string
    email?: string
    address?: string
    currency?: string
    paymentMethods?: string[]
    shippingMethods?: string[]
    socialLinks?: {
        facebook?: string
        instagram?: string
        line?: string
    }
    footerText?: string
}

export type TenantContextType = 'admin' | 'app'
