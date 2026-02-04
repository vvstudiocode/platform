'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateGeneralSettings } from './actions'
import { Loader2 } from 'lucide-react'

interface Props {
    tenant: {
        id: string
        name: string
        logo_url?: string
        settings?: any
    }
}

export function GeneralSettingsForm({ tenant }: Props) {
    const initialState = { error: '', success: '' }
    const [state, formAction, isPending] = useActionState(updateGeneralSettings, initialState) // @ts-ignore

    // Initial values
    const settings = tenant.settings || {}

    return (
        <form action={formAction} className="space-y-8 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
            {/* 商店識別 */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">商店識別</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">商店名稱</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={tenant.name}
                            placeholder="輸入商店名稱"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logo_url">Logo 網址</Label>
                        <Input
                            id="logo_url"
                            name="logo_url"
                            defaultValue={tenant.logo_url || ''}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </div>

            {/* 客製化設定 */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">客製化設定</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="primary_color">品牌主色</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                className="w-12 h-10 p-1 bg-zinc-800 border-zinc-700"
                                defaultValue={settings.primary_color || '#000000'}
                                onChange={(e) => {
                                    // Sync with text input if needed, or rely on native picker
                                    const textInput = document.getElementById('primary_color_text') as HTMLInputElement
                                    if (textInput) textInput.value = e.target.value
                                }}
                            />
                            <Input
                                id="primary_color"
                                name="primary_color"
                                defaultValue={settings.primary_color || '#000000'}
                                placeholder="#000000"
                                id="primary_color_text"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="support_email">客服 Email</Label>
                        <Input
                            id="support_email"
                            name="support_email"
                            type="email"
                            defaultValue={settings.support_email || ''}
                            placeholder="support@example.com"
                        />
                    </div>
                </div>
            </div>

            {/* 訊息顯示 */}
            {state?.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                    {state.error}
                </div>
            )}
            {state?.success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm">
                    {state.success}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending}>
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
