import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SpacingControls } from '../responsive-controls'
import { Trash2, Plus, Star, ChevronDown, ChevronRight } from 'lucide-react'
import type { EditorProps } from '../shared/types'
import { cn } from '@/lib/utils'

export function PricingEditor({ props, onChange }: EditorProps) {
    const plans = props.plans || []
    const [expandedPlans, setExpandedPlans] = React.useState<number[]>([0]) // 預設展開第一個

    const toggleExpand = (index: number) => {
        setExpandedPlans(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    const updatePlan = (index: number, field: string, value: any) => {
        const newPlans = [...plans]
        newPlans[index] = { ...newPlans[index], [field]: value }
        onChange({ plans: newPlans })
    }

    const updatePlanFeature = (planIndex: number, featureIndex: number, value: string) => {
        const newPlans = [...plans]
        const newFeatures = [...(newPlans[planIndex].features || [])]
        newFeatures[featureIndex] = value
        newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures }
        onChange({ plans: newPlans })
    }

    const addFeature = (planIndex: number) => {
        const newPlans = [...plans]
        const newFeatures = [...(newPlans[planIndex].features || []), '新功能']
        newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures }
        onChange({ plans: newPlans })
    }

    const removeFeature = (planIndex: number, featureIndex: number) => {
        const newPlans = [...plans]
        const newFeatures = [...(newPlans[planIndex].features || [])]
        newFeatures.splice(featureIndex, 1)
        newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures }
        onChange({ plans: newPlans })
    }

    const addPlan = () => {
        const newIndex = plans.length
        onChange({
            plans: [
                ...plans,
                {
                    name: '新方案',
                    price: '49',
                    yearlyPrice: '39',
                    period: '每月',
                    features: ['功能 1', '功能 2'],
                    description: '方案描述',
                    buttonText: '立即開始',
                    href: '#',
                    isPopular: false,
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

    return (
        <div className="space-y-6 pb-20">
            {/* 區塊標題設定 */}
            <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground/80 border-b pb-2">區塊設定</h4>
                <div className="space-y-2">
                    <label className="text-sm font-medium">標題</label>
                    <Input
                        value={props.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="方案價格"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">描述</label>
                    <Textarea
                        value={props.description || ''}
                        onChange={(e) => onChange({ description: e.target.value })}
                        placeholder="選擇最適合您的方案..."
                        rows={3}
                    />
                </div>
            </div>

            {/* 年繳切換設定 */}
            <div className="space-y-4 pt-2">
                <h4 className="font-medium text-sm text-foreground/80 border-b pb-2">年繳切換設定</h4>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">顯示年繳切換</label>
                    <Switch
                        checked={props.showAnnualToggle !== false}
                        onCheckedChange={(checked) => onChange({ showAnnualToggle: checked })}
                    />
                </div>
                {props.showAnnualToggle !== false && (
                    <div className="space-y-3 bg-muted/20 p-3 rounded-lg border border-dashed">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">切換文字</label>
                            <Input
                                value={props.annualToggleText || '年繳方案（省 20%）'}
                                onChange={(e) => onChange({ annualToggleText: e.target.value })}
                                placeholder="年繳方案（省 20%）"
                                className="h-9"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">月繳標籤</label>
                                <Input
                                    value={props.monthlyLabel || '按月計費'}
                                    onChange={(e) => onChange({ monthlyLabel: e.target.value })}
                                    placeholder="按月計費"
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">年繳標籤</label>
                                <Input
                                    value={props.yearlyLabel || '按年計費'}
                                    onChange={(e) => onChange({ yearlyLabel: e.target.value })}
                                    placeholder="按年計費"
                                    className="h-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">貨幣符號</label>
                            <Input
                                value={props.currencySymbol || 'NT$'}
                                onChange={(e) => onChange({ currencySymbol: e.target.value })}
                                placeholder="NT$"
                                className="h-9"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 顏色設定 */}
            <div className="space-y-4 pt-2">
                <h4 className="font-medium text-sm text-foreground/80 border-b pb-2">顏色設定</h4>
                <div className="grid grid-cols-1 gap-3">
                    {[
                        { label: '主色調', key: 'primaryColor', default: '#6366f1' },
                        { label: '背景色', key: 'backgroundColor', default: '#ffffff' },
                        { label: '文字色', key: 'textColor', default: '#333333' },
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

            {/* 方案列表 */}
            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b pb-2">
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
                                            {plan.isPopular && (
                                                <Star className="inline w-3 h-3 ml-2 text-amber-500 fill-amber-500" />
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">熱門</span>
                                            <Switch
                                                checked={plan.isPopular || false}
                                                onCheckedChange={(checked) =>
                                                    updatePlan(index, 'isPopular', checked)
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
                                            {/* Plan Name */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">方案名稱</label>
                                                <Input
                                                    value={plan.name || ''}
                                                    onChange={(e) => updatePlan(index, 'name', e.target.value)}
                                                    placeholder="方案名稱"
                                                    className="h-9"
                                                />
                                            </div>

                                            {/* Pricing */}
                                            <div className="grid grid-cols-2 gap-3">
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
                                                        placeholder="79"
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>

                                            {/* Period */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">計費週期</label>
                                                <Input
                                                    value={plan.period || ''}
                                                    onChange={(e) => updatePlan(index, 'period', e.target.value)}
                                                    placeholder="每月"
                                                    className="h-9"
                                                />
                                            </div>

                                            {/* Button */}
                                            <div className="grid grid-cols-2 gap-3">
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
                                                        value={plan.href || ''}
                                                        onChange={(e) => updatePlan(index, 'href', e.target.value)}
                                                        placeholder="/sign-up"
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">方案描述</label>
                                                <Input
                                                    value={plan.description || ''}
                                                    onChange={(e) => updatePlan(index, 'description', e.target.value)}
                                                    placeholder="適合個人與小型專案"
                                                    className="h-9"
                                                />
                                            </div>

                                            {/* Features */}
                                            <div className="space-y-2.5 pt-2 border-t mt-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">功能列表</label>
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
                                                    {(plan.features || []).map((feature: string, fIndex: number) => (
                                                        <div key={fIndex} className="flex gap-1.5 items-center p-2 bg-muted/20 rounded-md border border-dashed">
                                                            <Input
                                                                value={feature}
                                                                onChange={(e) =>
                                                                    updatePlanFeature(index, fIndex, e.target.value)
                                                                }
                                                                className="flex-1 text-xs h-8 bg-background"
                                                                placeholder="功能描述"
                                                            />
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

            <div className="pt-2 border-t">
                <SpacingControls
                    paddingY={{
                        desktop: props.paddingYDesktop ?? 64,
                        mobile: props.paddingYMobile ?? 32,
                    }}
                    onChange={onChange}
                />
            </div>
        </div>
    )
}
