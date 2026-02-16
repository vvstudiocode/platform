'use client'

import { useActionState, useState } from 'react'
import { Loader2, Search, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
    tenant: {
        id: string
        settings?: any
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
                <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                </div>
                {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </button>
            <div className={`p-6 border-t border-border animate-in slide-in-from-top-2 duration-200 ${isOpen ? '' : 'hidden'}`}>
                {children}
            </div>
        </div>
    )
}

export function SeoSettingsForm({ tenant, updateAction }: Props) {
    const [state, formAction, isPending] = useActionState(updateAction, {})

    const settings = tenant.settings || {}

    return (
        <form action={formAction} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {state.error && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 flex items-center gap-2">
                    {state.error}
                </div>
            )}

            {state.success && (
                <div className="p-4 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium border border-green-500/20 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    設定已成功更新
                </div>
            )}

            <CollapsibleSection title="SEO & 分析" defaultOpen={true}>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">串接 Google 服務以追蹤網站流量與搜尋引擎收錄。</p>

                    <div>
                        <Label htmlFor="ga4_measurement_id">Google Analytics 4 評估 ID</Label>
                        <Input
                            id="ga4_measurement_id"
                            name="ga4_measurement_id"
                            defaultValue={settings.analytics?.ga4_measurement_id || ''}
                            placeholder="G-XXXXXXXXXX"
                            className="bg-background font-mono"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            請至 <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Analytics</a> 取得評估 ID（格式為 G- 開頭）。
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="gsc_verification_code">Google Search Console 驗證碼</Label>
                        <Input
                            id="gsc_verification_code"
                            name="gsc_verification_code"
                            defaultValue={settings.analytics?.gsc_verification_code || ''}
                            placeholder="驗證碼 (meta tag content 值)"
                            className="bg-background font-mono"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            請至 <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary underline">Search Console</a> 選擇「HTML 標記」驗證方式，複製 content 值。
                        </p>
                    </div>
                </div>
            </CollapsibleSection>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending} className="min-w-[120px]">
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            儲存中...
                        </>
                    ) : (
                        '儲存變更'
                    )}
                </Button>
            </div>
        </form>
    )
}
