'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'

interface PointsSettings {
    points_enabled: boolean
    points_earn_rate: number // Spend $100
    points_earn_value: number // Get 1 point
    points_redeem_value: number // 1 Point = $1
    points_max_redeem_percent: number // Max 100% of order
    points_expiry_days: number
}

interface Props {
    storeId: string
    initialSettings?: any
}

export function MemberPointsSettings({ storeId, initialSettings }: Props) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const [settings, setSettings] = useState<PointsSettings>({
        points_enabled: initialSettings?.points_enabled || false,
        points_earn_rate: initialSettings?.points_earn_rate || 100,
        points_earn_value: initialSettings?.points_earn_value || 1,
        points_redeem_value: initialSettings?.points_redeem_value || 1,
        points_max_redeem_percent: initialSettings?.points_max_redeem_percent || 100,
        points_expiry_days: initialSettings?.points_expiry_days || 365
    })

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)
        try {
            // Update tenant settings
            const { data: currentTenant, error: fetchError } = await supabase
                .from('tenants')
                .select('settings')
                .eq('id', storeId)
                .single()

            if (fetchError) throw fetchError

            const newSettings = {
                ...currentTenant.settings,
                ...settings
            }

            const { error } = await supabase
                .from('tenants')
                .update({ settings: newSettings })
                .eq('id', storeId)

            if (error) throw error

            setMessage({ type: 'success', text: '儲存成功' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            console.error('Error saving:', error)
            setMessage({ type: 'error', text: '儲存失敗' })
        } finally {
            setSaving(false)
        }
    }

    const updateSetting = (field: keyof PointsSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>點數規則設定</CardTitle>
                    <CardDescription>設定顧客消費如何累積與折抵點數。</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {message && (
                        <span className={`text-sm mr-2 ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {message.text}
                        </span>
                    )}
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        儲存設定
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-0.5">
                        <Label>啟用點數功能</Label>
                        <div className="text-sm text-muted-foreground">
                            啟用後，顧客消費將依規則累積點數，並可於結帳時折抵。
                        </div>
                    </div>
                    <Switch
                        checked={settings.points_enabled}
                        onCheckedChange={(checked) => updateSetting('points_enabled', checked)}
                    />
                </div>

                <div className={settings.points_enabled ? 'space-y-6' : 'space-y-6 opacity-50 pointer-events-none'}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-base">累積規則</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">每消費</span>
                                <div className="relative w-24">
                                    <span className="absolute left-2.5 top-2.5 text-muted-foreground">$</span>
                                    <Input
                                        type="number"
                                        className="pl-6"
                                        value={settings.points_earn_rate}
                                        onChange={(e) => updateSetting('points_earn_rate', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <span className="text-sm">元，獲得</span>
                                <Input
                                    type="number"
                                    className="w-20"
                                    value={settings.points_earn_value}
                                    onChange={(e) => updateSetting('points_earn_value', parseInt(e.target.value) || 0)}
                                />
                                <span className="text-sm">點</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                例如：每消費 $100 元獲得 1 點。
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base">折抵規則</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">每</span>
                                <Input
                                    type="number"
                                    className="w-20"
                                    value={1}
                                    disabled
                                />
                                <span className="text-sm">點，可折抵</span>
                                <div className="relative w-24">
                                    <span className="absolute left-2.5 top-2.5 text-muted-foreground">$</span>
                                    <Input
                                        type="number"
                                        className="pl-6"
                                        value={settings.points_redeem_value}
                                        onChange={(e) => updateSetting('points_redeem_value', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <span className="text-sm">元</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                例如：每 1 點可折抵 $1 元。
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div className="space-y-2">
                            <Label>折抵上限</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">單筆訂單最高折抵</span>
                                <div className="relative w-24">
                                    <Input
                                        type="number"
                                        value={settings.points_max_redeem_percent}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value)
                                            if (val > 100) updateSetting('points_max_redeem_percent', 100)
                                            else updateSetting('points_max_redeem_percent', val || 0)
                                        }}
                                    />
                                    <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                </div>
                                <span className="text-sm">金額</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                設定 100% 代表可全額折抵。
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>點數效期</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">獲得後</span>
                                <Input
                                    type="number"
                                    className="w-24"
                                    value={settings.points_expiry_days}
                                    onChange={(e) => updateSetting('points_expiry_days', parseInt(e.target.value) || 365)}
                                />
                                <span className="text-sm">天到期</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                預設為 365 天。
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
