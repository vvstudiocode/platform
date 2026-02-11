'use client'

import { useActionState, useState, useEffect } from 'react'
import { Loader2, Store, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/image-upload'
import { uploadImage } from '@/lib/upload-utils'

interface Props {
    tenant: {
        id: string
        name: string
        slug: string
        description?: string | null
        logo_url?: string | null
        settings?: any
        footer_settings?: any
    }
    updateAction: (prevState: any, formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
            >
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </button>
            <div className={`p-6 border-t border-border animate-in slide-in-from-top-2 duration-200 ${isOpen ? '' : 'hidden'}`}>
                {children}
            </div>
        </div>
    )
}

export function GeneralSettingsForm({ tenant, updateAction }: Props) {
    const [state, formAction, isPending] = useActionState(updateAction, {})
    const [logoUrl, setLogoUrl] = useState(tenant.logo_url || '')

    const settings = tenant.settings || {}
    const footer = tenant.footer_settings || {}
    const social = footer.socialLinks || {}

    return (
        <form action={formAction} className="space-y-6">
            {state?.error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4">
                    {state.error}
                </div>
            )}
            {state?.success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg p-4 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    設定已儲存
                </div>
            )}

            {/* 基本資訊 */}
            <CollapsibleSection title="基本資訊" defaultOpen={true}>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">商店名稱 *</Label>
                        <Input id="name" name="name" required defaultValue={tenant.name} className="bg-background" />
                    </div>

                    <div>
                        <Label>商店網址</Label>
                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                            <Store className="h-4 w-4" />
                            /store/{tenant.slug}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">商店描述</Label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            defaultValue={tenant.description || ''}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
                        />
                    </div>

                    <div>
                        <Label>Logo 圖片</Label>
                        <div className="mt-2">
                            <ImageUpload
                                currentUrl={logoUrl}
                                onUpload={async (formData) => {
                                    try {
                                        const file = formData.get('file') as File
                                        if (!file) throw new Error('No file')
                                        const url = await uploadImage(file, { bucket: 'store-logos' })
                                        setLogoUrl(url)
                                        return { url }
                                    } catch (e: any) {
                                        return { error: e.message }
                                    }
                                }}
                                onRemove={async () => setLogoUrl('')}
                            />
                            <input type="hidden" name="logo_url" value={logoUrl} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">建議尺寸：512x512px，支援 JPG/PNG。</p>
                    </div>

                    <div>
                        <Label htmlFor="primary_color_text">品牌主色</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                type="color"
                                className="w-12 h-10 p-1 bg-background border-input cursor-pointer"
                                defaultValue={settings.primary_color || '#000000'}
                                onChange={(e) => {
                                    const textInput = document.getElementById('primary_color_text') as HTMLInputElement
                                    if (textInput) textInput.value = e.target.value
                                }}
                            />
                            <Input
                                id="primary_color_text"
                                name="primary_color"
                                defaultValue={settings.primary_color || '#000000'}
                                placeholder="#000000"
                                className="bg-background font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="support_email">客服 Email</Label>
                        <Input
                            id="support_email"
                            name="support_email"
                            type="email"
                            defaultValue={settings.support_email || ''}
                            placeholder="support@example.com"
                            className="bg-background"
                        />
                    </div>
                </div>
            </CollapsibleSection>

            {/* 付款方式 (來自 App，新增至 Admin) */}
            <CollapsibleSection title="付款方式">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">勾選要在結帳頁面顯示的付款方式。</p>

                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 cursor-pointer hover:border-primary/50 transition-colors">
                            <input
                                type="checkbox"
                                name="payment_credit_card"
                                defaultChecked={settings.payment_methods?.credit_card !== false}
                                className="w-4 h-4 rounded border-input text-primary focus:ring-primary bg-background"
                            />
                            <div>
                                <span className="text-foreground font-medium block">信用卡一次付清</span>
                                <span className="text-xs text-muted-foreground">支援 Visa, MasterCard, JCB</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 cursor-pointer hover:border-primary/50 transition-colors">
                            <input
                                type="checkbox"
                                name="payment_bank_transfer"
                                defaultChecked={settings.payment_methods?.bank_transfer !== false}
                                className="w-4 h-4 rounded border-input text-primary focus:ring-primary bg-background"
                            />
                            <div>
                                <span className="text-foreground font-medium block">銀行轉帳 / 面交付款</span>
                                <span className="text-xs text-muted-foreground">顧客下單後顯示匯款資訊</span>
                            </div>
                        </label>
                    </div>
                </div>
            </CollapsibleSection>

            {/* 匯款資訊 (來自 Admin & App) */}
            <CollapsibleSection title="匯款資訊">
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="bank_name">銀行名稱</Label>
                            <Input id="bank_name" name="bank_name" defaultValue={settings.bank_name || ''} placeholder="例：國泰世華" className="bg-background" />
                        </div>
                        <div>
                            <Label htmlFor="bank_code">銀行代碼</Label>
                            <Input id="bank_code" name="bank_code" defaultValue={settings.bank_code || ''} placeholder="例：013" className="bg-background" />
                        </div>
                        <div>
                            <Label htmlFor="bank_account">銀行帳號</Label>
                            <Input id="bank_account" name="bank_account" defaultValue={settings.bank_account || ''} placeholder="銀行帳號" className="bg-background" />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="payment_message">付款成功訊息</Label>
                        <textarea
                            id="payment_message"
                            name="payment_message"
                            rows={3}
                            defaultValue={settings.payment_message || ''}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
                            placeholder="訂單成功後顯示給客戶的訊息"
                        />
                    </div>
                </div>
            </CollapsibleSection>

            {/* 運費設定 (來自 Admin & App) */}
            <CollapsibleSection title="運費設定">
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="shipping_pickup_fee">面交運費</Label>
                            <Input
                                id="shipping_pickup_fee"
                                name="shipping_pickup_fee"
                                type="number"
                                min="0"
                                defaultValue={settings.shipping_pickup_fee || 0}
                                className="bg-background"
                            />
                        </div>
                        <div>
                            <Label htmlFor="shipping_711_fee">7-11 運費</Label>
                            <Input
                                id="shipping_711_fee"
                                name="shipping_711_fee"
                                type="number"
                                min="0"
                                defaultValue={settings.shipping_711_fee || 60}
                                className="bg-background"
                            />
                        </div>
                        <div>
                            <Label htmlFor="shipping_home_fee">宅配運費</Label>
                            <Input
                                id="shipping_home_fee"
                                name="shipping_home_fee"
                                type="number"
                                min="0"
                                defaultValue={settings.shipping_home_fee || 100}
                                className="bg-background"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 mt-4">
                        <div>
                            <Label htmlFor="shipping_pickup_name">面交名稱</Label>
                            <Input
                                id="shipping_pickup_name"
                                name="shipping_pickup_name"
                                defaultValue={settings.shipping_pickup_name || '面交取貨'}
                                placeholder="預設：面交取貨"
                                className="bg-background"
                            />
                        </div>
                        <div>
                            <Label htmlFor="shipping_711_name">7-11 名稱</Label>
                            <Input
                                id="shipping_711_name"
                                name="shipping_711_name"
                                defaultValue={settings.shipping_711_name || '7-11 店到店'}
                                placeholder="預設：7-11 店到店"
                                className="bg-background"
                            />
                        </div>
                        <div>
                            <Label htmlFor="shipping_home_name">宅配名稱</Label>
                            <Input
                                id="shipping_home_name"
                                name="shipping_home_name"
                                defaultValue={settings.shipping_home_name || '宅配到府'}
                                placeholder="預設：宅配到府"
                                className="bg-background"
                            />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                        <Label htmlFor="free_shipping_threshold">滿額免運門檻</Label>
                        <p className="text-xs text-muted-foreground mb-2">當訂單金額達到此設定值時，運費將自動減免為 0。設定為 0 代表不啟用。</p>
                        <div className="relative max-w-xs">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">NT$</span>
                            <Input
                                id="free_shipping_threshold"
                                name="free_shipping_threshold"
                                type="number"
                                min="0"
                                defaultValue={settings.free_shipping_threshold || 0}
                                className="pl-10 bg-background"
                            />
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {/* 頁尾設定 (來自 Admin & App) */}
            <CollapsibleSection title="頁尾設定">
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium text-foreground mb-2 block">社交媒體連結</Label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="footer_line" className="text-xs text-muted-foreground">LINE</Label>
                                <Input id="footer_line" name="footer_line" placeholder="https://..." defaultValue={social.line || ''} className="bg-background" />
                            </div>
                            <div>
                                <Label htmlFor="footer_facebook" className="text-xs text-muted-foreground">Facebook</Label>
                                <Input id="footer_facebook" name="footer_facebook" placeholder="https://..." defaultValue={social.facebook || ''} className="bg-background" />
                            </div>
                            <div>
                                <Label htmlFor="footer_instagram" className="text-xs text-muted-foreground">Instagram</Label>
                                <Input id="footer_instagram" name="footer_instagram" placeholder="https://..." defaultValue={social.instagram || ''} className="bg-background" />
                            </div>
                            <div>
                                <Label htmlFor="footer_threads" className="text-xs text-muted-foreground">Threads</Label>
                                <Input id="footer_threads" name="footer_threads" placeholder="https://..." defaultValue={social.threads || ''} className="bg-background" />
                            </div>
                            <div>
                                <Label htmlFor="footer_youtube" className="text-xs text-muted-foreground">YouTube</Label>
                                <Input id="footer_youtube" name="footer_youtube" placeholder="https://..." defaultValue={social.youtube || ''} className="bg-background" />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="footer_email">Email</Label>
                            <Input id="footer_email" name="footer_email" type="email" placeholder="contact@example.com" defaultValue={footer.email || ''} className="bg-background" />
                        </div>
                        <div>
                            <Label htmlFor="footer_phone">電話 (10碼)</Label>
                            <Input id="footer_phone" name="footer_phone" placeholder="例：0912345678" maxLength={10} defaultValue={footer.phone || ''} className="bg-background" />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="footer_address">地址</Label>
                        <Input id="footer_address" name="footer_address" placeholder="台北市..." defaultValue={footer.address || ''} className="bg-background" />
                    </div>

                    <div>
                        <Label htmlFor="footer_about">關於我們</Label>
                        <textarea
                            id="footer_about"
                            name="footer_about"
                            rows={3}
                            defaultValue={footer.about || ''}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
                            placeholder="簡短介紹您的商店..."
                        />
                    </div>

                    <div>
                        <Label htmlFor="footer_copyright">版權宣告</Label>
                        <Input id="footer_copyright" name="footer_copyright" placeholder="© 2024 商店名稱" defaultValue={footer.copyright || ''} className="bg-background" />
                    </div>
                </div>
            </CollapsibleSection>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto shadow-soft">
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            儲存中...
                        </>
                    ) : (
                        '儲存設定'
                    )}
                </Button>
            </div>
        </form>
    )
}
