import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SpacingControls } from '../responsive-controls'
import { Trash2, Plus, Star, Info, ChevronDown, ChevronRight } from 'lucide-react'
import type { EditorProps } from '../shared/types'
import { cn } from '@/lib/utils'

export function PricingSection2Editor({ props, onChange }: EditorProps) {
    const plans = props.plans || []
    const [expandedPlans, setExpandedPlans] = React.useState<number[]>([0]) // 預設展開第一個

    const toggleExpand = (index: number) => {
        setExpandedPlans(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    // ─── Plan helpers ───────────────────────────────────────────────────────

    const updatePlan = (index: number, field: string, value: any) => {
        const newPlans = [...plans]
        newPlans[index] = { ...newPlans[index], [field]: value }
        onChange({ plans: newPlans })
    }

    const addPlan = () => {
        const newIndex = plans.length
        onChange({
            plans: [
                ...plans,
                {
                    name: '新方案',
                    description: '方案描述',
                    price: '49',
                    yearlyPrice: '490',
                    buttonText: '立即開始',
                    buttonHref: '#',
                    buttonVariant: 'outline',
                    popular: false,
                    features: [
                        { text: '功能 1' },
                        { text: '功能 2' },
                    ],
                },
            ],
        })
        setExpandedPlans(prev => [...prev, newIndex])
    }

    const removePlan = (index: number) => {
        const newPlans = [...plans]
        newPlans.splice(index, 1)
        onChange({ plans: newPlans })
        setExpandedPlans(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i))
    }

    // ─── Feature helpers ────────────────────────────────────────────────────

    const getFeatures = (plan: any): { text: string; tooltip?: string }[] => {
        // 支援新版 features 和舊版 includes
        if (plan.features && plan.features.length > 0) return plan.features
        if (plan.includes && plan.includes.length > 0)
            return plan.includes.map((t: string) => ({ text: t }))
        return []
    }

    const updateFeature = (planIndex: number, featureIndex: number, field: 'text' | 'tooltip', value: string) => {
        const newPlans = [...plans]
        const features = getFeatures(newPlans[planIndex])
        features[featureIndex] = { ...features[featureIndex], [field]: value }
        newPlans[planIndex] = { ...newPlans[planIndex], features, includes: undefined }
        onChange({ plans: newPlans })
    }

    const addFeature = (planIndex: number) => {
        const newPlans = [...plans]
        const features = [...getFeatures(newPlans[planIndex]), { text: '新功能' }]
        newPlans[planIndex] = { ...newPlans[planIndex], features, includes: undefined }
        onChange({ plans: newPlans })
    }

    const removeFeature = (planIndex: number, featureIndex: number) => {
        const newPlans = [...plans]
        const features = getFeatures(newPlans[planIndex])
        features.splice(featureIndex, 1)
        newPlans[planIndex] = { ...newPlans[planIndex], features, includes: undefined }
        onChange({ plans: newPlans })
    }

    return (
        <div className="space-y-6 pb-20">

            {/* ── 區塊設定 ─────────────────────────────────────────────── */}
            <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground/80">區塊設定</h4>
                <div className="space-y-2">
                    <label className="text-xs font-medium">標題</label>
                    <Input
                        value={props.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="選擇最適合您的方案"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium">描述</label>
                    <Textarea
                        value={props.description || ''}
                        onChange={(e) => onChange({ description: e.target.value })}
                        placeholder="受到數百萬人信賴..."
                        rows={2}
                    />
                </div>
            </div>

            {/* ── 月/年切換 ─────────────────────────────────────────────── */}
            <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground/80">月/年切換設定</h4>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">顯示切換按鈕</label>
                    <Switch
                        checked={props.showAnnualToggle !== false}
                        onCheckedChange={(checked) => onChange({ showAnnualToggle: checked })}
                    />
                </div>
                {props.showAnnualToggle !== false && (
                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">月繳標籤</label>
                            <Input
                                value={props.monthlyLabel || '月繳'}
                                onChange={(e) => onChange({ monthlyLabel: e.target.value })}
                                placeholder="月繳"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">年繳標籤</label>
                            <Input
                                value={props.yearlyLabel || '年繳'}
                                onChange={(e) => onChange({ yearlyLabel: e.target.value })}
                                placeholder="年繳"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">貨幣符號</label>
                            <Input
                                value={props.currencySymbol || 'NT$'}
                                onChange={(e) => onChange({ currencySymbol: e.target.value })}
                                placeholder="NT$"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── 顏色設定 ─────────────────────────────────────────────── */}
            <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-sm text-foreground/80">顏色設定</h4>
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { label: '主色調（按鈕/強調）', key: 'primaryColor', default: '#000000' },
                        { label: '背景色', key: 'backgroundColor', default: '#ffffff' },
                        { label: '文字色', key: 'textColor', default: '#000000' },
                        { label: '切換按鈕顏色（預設跟主色調）', key: 'toggleColor', default: '#000000' },
                        { label: '切換按鈕文字色', key: 'toggleTextColor', default: '#ffffff' },
                    ].map(({ label, key, default: def }) => (
                        <div key={key} className="space-y-1">
                            <label className="text-xs font-medium">{label}</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={props[key] || def}
                                    onChange={(e) => onChange({ [key]: e.target.value })}
                                    className="w-8 h-8 rounded border cursor-pointer shrink-0"
                                />
                                <Input
                                    value={props[key] || def}
                                    onChange={(e) => onChange({ [key]: e.target.value })}
                                    className="flex-1 text-xs font-mono"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 方案列表 ─────────────────────────────────────────────── */}
            <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-foreground/80">
                        方案列表 ({plans.length})
                    </h4>
                    <Button variant="outline" size="sm" onClick={addPlan} className="h-8">
                        <Plus className="w-3.5 h-3.5 mr-1" /> 新增方案
                    </Button>
                </div>

                <div className="space-y-3">
                    {plans.map((plan: any, index: number) => {
                        const isExpanded = expandedPlans.includes(index)
                        const features = getFeatures(plan)
                        
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "border rounded-lg overflow-hidden transition-all duration-200",
                                    isExpanded ? "bg-muted/30 ring-1 ring-primary/20 shadow-sm" : "bg-muted/10"
                                )}
                            >
                                {/* Plan Header (Click to toggle) */}
                                <div 
                                    className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-muted/40 transition-colors"
                                    onClick={() => toggleExpand(index)}
                                >
                                    <div className="flex items-center gap-2">
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                        <span className="text-sm font-bold">
                                            {plan.name || `方案 ${index + 1}`}
                                            {plan.popular && (
                                                <Star className="inline w-3 h-3 ml-2 text-amber-500 fill-amber-500" />
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">熱門</span>
                                            <Switch
                                                checked={plan.popular || false}
                                                onCheckedChange={(checked) =>
                                                    updatePlan(index, 'popular', checked)
                                                }
                                                className="scale-75 origin-right"
                                            />
                                        </label>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePlan(index)}
                                            className="shrink-0 text-muted-foreground hover:text-destructive h-7 w-7"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="p-4 pt-0 border-t space-y-4 mt-1 bg-background/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="pt-4 space-y-3">
                                            {/* Name & Description */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">方案名稱</label>
                                                    <Input
                                                        value={plan.name || ''}
                                                        onChange={(e) => updatePlan(index, 'name', e.target.value)}
                                                        placeholder="方案名稱"
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">方案描述</label>
                                                    <Input
                                                        value={plan.description || ''}
                                                        onChange={(e) => updatePlan(index, 'description', e.target.value)}
                                                        placeholder="適合個人..."
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>

                                            {/* Pricing */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">月繳價格</label>
                                                    <Input
                                                        type="number"
                                                        value={plan.price || ''}
                                                        onChange={(e) => updatePlan(index, 'price', e.target.value)}
                                                        placeholder="99"
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">年繳價格</label>
                                                    <Input
                                                        type="number"
                                                        value={plan.yearlyPrice || ''}
                                                        onChange={(e) => updatePlan(index, 'yearlyPrice', e.target.value)}
                                                        placeholder="990"
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>

                                            {/* Button */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">按鈕文字</label>
                                                    <Input
                                                        value={plan.buttonText || ''}
                                                        onChange={(e) => updatePlan(index, 'buttonText', e.target.value)}
                                                        placeholder="立即開始"
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">按鈕連結</label>
                                                    <Input
                                                        value={plan.buttonHref || ''}
                                                        onChange={(e) => updatePlan(index, 'buttonHref', e.target.value)}
                                                        placeholder="https://..."
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="space-y-2.5 pt-2 border-t mt-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                        功能列表
                                                        <Info className="w-3 h-3 text-muted-foreground" />
                                                    </label>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addFeature(index)}
                                                        className="h-7 text-xs px-2"
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" /> 新增功能
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {features.map((feature: any, fIndex: number) => (
                                                        <div key={fIndex} className="flex gap-1.5 items-start p-2 bg-muted/20 rounded-md border border-dashed">
                                                            <div className="flex-1 space-y-1.5">
                                                                <Input
                                                                    value={feature.text || ''}
                                                                    onChange={(e) =>
                                                                        updateFeature(index, fIndex, 'text', e.target.value)
                                                                    }
                                                                    className="text-xs h-8 bg-background"
                                                                    placeholder="功能描述"
                                                                />
                                                                <Input
                                                                    value={feature.tooltip || ''}
                                                                    onChange={(e) =>
                                                                        updateFeature(index, fIndex, 'tooltip', e.target.value)
                                                                    }
                                                                    className="text-[10px] h-7 text-muted-foreground bg-background"
                                                                    placeholder="Tooltip 說明（選填）"
                                                                />
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeFeature(index, fIndex)}
                                                                className="shrink-0 text-muted-foreground hover:text-destructive h-7 w-7"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── 間距設定 ─────────────────────────────────────────────── */}
            <div className="border-t pt-4">
                <SpacingControls
                    paddingY={{
                        desktop: props.paddingYDesktop ?? 64,
                        mobile: props.paddingYMobile ?? 40,
                    }}
                    onChange={onChange}
                />
            </div>
        </div>
    )
}
