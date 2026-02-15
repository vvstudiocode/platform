'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Save, Trash2, HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface MemberLevel {
    id: string
    name: string
    min_spend: number
    discount_type: 'percent' | 'fixed' | 'none'
    discount_value: number
    point_rate: number // Changed from point_earn_rate to match App usage, will map
    is_default?: boolean
}

interface Props {
    storeId: string
    initialLevels: MemberLevel[]
}

export function MemberLevelForm({ storeId, initialLevels }: Props) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [levels, setLevels] = useState<MemberLevel[]>(initialLevels)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const upsertData = levels.map(l => ({
                id: l.id, // Using the ID directly
                tenant_id: storeId,
                name: l.name,
                min_spend: l.min_spend,
                discount_type: l.discount_type,
                discount_value: l.discount_value,
                point_earn_rate: l.point_rate, // Map back to DB column
                is_default: l.is_default || false,
                updated_at: new Date().toISOString()
            }))

            const { error } = await supabase
                .from('member_levels')
                .upsert(upsertData, { onConflict: 'id' })

            if (error) throw error

            setMessage({ type: 'success', text: '儲存成功' })
            setTimeout(() => setMessage(null), 3000)

            // Optionally refresh or just keep state
        } catch (error) {
            console.error('Error saving:', error)
            setMessage({ type: 'error', text: '儲存失敗' })

        } finally {
            setSaving(false)
        }
    }

    const generateId = () => {
        return typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    const addLevel = () => {
        setLevels([...levels, {
            id: generateId(),
            name: '新等級',
            min_spend: 0,
            discount_type: 'percent',
            discount_value: 0,
            point_rate: 1.0,
            is_default: false
        }])
    }

    const removeLevel = async (id: string, index: number) => {
        // Optimistic update
        const originalLevels = [...levels]
        // Use ID if valid, otherwise fallback to index if ID is temp/missing (shouldn't happen with generateId)
        setLevels(levels.filter((l, idx) => l.id !== id))

        try {
            // Only try to delete from DB if it looks like a real UUID (length > 20)
            if (id && id.length > 20 && !id.startsWith('temp-')) {
                const { error } = await supabase.from('member_levels').delete().eq('id', id)
                if (error) {
                    console.warn("Delete failed or item didn't exist", error)
                }
            }
        } catch (e) {
            console.error(e)
            setLevels(originalLevels) // Revert
        }
    }

    const updateLevel = (id: string, field: keyof MemberLevel, value: any) => {
        setLevels(levels.map(l => l.id === id ? { ...l, [field]: value } : l))
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>會員等級</CardTitle>
                    <CardDescription>設定不同等級的升級門檻與優惠，系統將於每日凌晨或訂單完成時自動計算升級。</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {message && (
                        <span className={`text-sm mr-2 ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {message.text}
                        </span>
                    )}
                    <Button onClick={handleSave} disabled={saving} className="mr-2">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        儲存
                    </Button>
                    <Button size="sm" variant="outline" onClick={addLevel}>
                        <Plus className="h-4 w-4 mr-2" />
                        新增等級
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {levels.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        尚未設定會員等級
                    </div>
                )}
                {levels.map((level, index) => (
                    <div key={level.id} className="grid grid-cols-12 gap-4 items-end border-b pb-6 last:border-0 last:pb-0">
                        <div className="col-span-12 md:col-span-3">
                            <Label>等級名稱</Label>
                            <Input
                                value={level.name}
                                onChange={(e) => updateLevel(level.id, 'name', e.target.value)}
                                placeholder="例如：黃金會員"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-3">
                            <Label>升級門檻 (累積消費)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    type="number"
                                    className="pl-7"
                                    value={level.min_spend}
                                    onChange={(e) => updateLevel(level.id, 'min_spend', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-3">
                            <Label>購物優惠</Label>
                            <div className="flex gap-2">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={level.discount_type}
                                    onChange={(e) => updateLevel(level.id, 'discount_type', e.target.value)}
                                >
                                    <option value="none">無折扣</option>
                                    <option value="percent">折扣 %</option>
                                    <option value="fixed">折抵金額</option>
                                </select>
                                {(level.discount_type === 'percent' || level.discount_type === 'fixed') && (
                                    <Input
                                        type="number"
                                        value={level.discount_value}
                                        onChange={(e) => updateLevel(level.id, 'discount_value', parseFloat(e.target.value) || 0)}
                                        className="w-24"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-2">
                            <div className="flex items-center gap-1 mb-1.5">
                                <Label>點數回饋倍率</Label>
                                <div title="1.0 為正常回饋，1.5 為 1.5 倍回饋" className="cursor-help text-muted-foreground">
                                    <HelpCircle className="h-3 w-3" />
                                </div>
                            </div>
                            <Input
                                type="number"
                                step="0.1"
                                value={level.point_rate}
                                onChange={(e) => updateLevel(level.id, 'point_rate', parseFloat(e.target.value) || 1)}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-1">
                            <Button variant="ghost" size="icon" onClick={() => removeLevel(level.id, index)} className="text-destructive h-10 w-10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
