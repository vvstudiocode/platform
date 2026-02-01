'use client'

import { useActionState } from 'react'
import { Loader2, Store, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
    store: {
        id: string
        name: string
        slug: string
        description: string | null
        logo_url: string | null
        settings: Record<string, any>
    }
    updateAction: (prevState: any, formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

export function SettingsForm({ store, updateAction }: Props) {
    const [state, formAction, pending] = useActionState(updateAction, {})

    const settings = store.settings || {}

    return (
        <form action={formAction} className="space-y-6">
            {state.error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
                    {state.error}
                </div>
            )}
            {state.success && (
                <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-lg p-4 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    設定已儲存
                </div>
            )}

            {/* 基本資訊 */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">基本資訊</h2>

                <div>
                    <Label htmlFor="name">商店名稱 *</Label>
                    <Input id="name" name="name" required defaultValue={store.name} />
                </div>

                <div>
                    <Label>商店網址</Label>
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Store className="h-4 w-4" />
                        /store/{store.slug}
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">商店描述</Label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        defaultValue={store.description || ''}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                </div>

                <div>
                    <Label htmlFor="logo_url">Logo 網址</Label>
                    <Input id="logo_url" name="logo_url" type="url" defaultValue={store.logo_url || ''} />
                    {store.logo_url && (
                        <img src={store.logo_url} alt="" className="w-16 h-16 object-cover rounded-lg mt-2" />
                    )}
                </div>
            </div>

            {/* 付款設定 */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">付款設定</h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <Label htmlFor="bank_name">銀行名稱</Label>
                        <Input id="bank_name" name="bank_name" defaultValue={settings.bank_name || ''} placeholder="例：國泰世華" />
                    </div>
                    <div>
                        <Label htmlFor="bank_code">銀行代碼</Label>
                        <Input id="bank_code" name="bank_code" defaultValue={settings.bank_code || ''} placeholder="例：013" />
                    </div>
                    <div>
                        <Label htmlFor="bank_account">銀行帳號</Label>
                        <Input id="bank_account" name="bank_account" defaultValue={settings.bank_account || ''} placeholder="銀行帳號" />
                    </div>
                </div>

                <div>
                    <Label htmlFor="payment_message">付款成功訊息</Label>
                    <textarea
                        id="payment_message"
                        name="payment_message"
                        rows={3}
                        defaultValue={settings.payment_message || ''}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        placeholder="訂單成功後顯示給客戶的訊息"
                    />
                </div>
            </div>

            {/* 運費設定 */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">運費設定</h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <Label htmlFor="shipping_pickup_fee">面交運費</Label>
                        <Input
                            id="shipping_pickup_fee"
                            name="shipping_pickup_fee"
                            type="number"
                            min="0"
                            defaultValue={settings.shipping_pickup_fee || 0}
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
                        />
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={pending} className="w-full">
                {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                儲存設定
            </Button>
        </form>
    )
}
