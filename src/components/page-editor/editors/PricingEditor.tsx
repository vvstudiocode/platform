import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SpacingControls } from '../responsive-controls'
import { Trash2, Plus, Star } from 'lucide-react'
import type { EditorProps } from '../shared/types'

export function PricingEditor({ props, onChange }: EditorProps) {
    const plans = props.plans || []

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
    }

    const removePlan = (index: number) => {
        const newPlans = [...plans]
        newPlans.splice(index, 1)
        onChange({ plans: newPlans })
    }

    return (
        <div className="space-y-6">
            {/* 區塊標題設定 */}
            <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground/80">區塊設定</h4>
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
            <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground/80">年繳切換設定</h4>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">顯示年繳切換</label>
                    <Switch
                        checked={props.showAnnualToggle !== false}
                        onCheckedChange={(checked) => onChange({ showAnnualToggle: checked })}
                    />
                </div>
                {props.showAnnualToggle !== false && (
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">切換文字</label>
                            <Input
                                value={props.annualToggleText || '年繳方案（省 20%）'}
                                onChange={(e) => onChange({ annualToggleText: e.target.value })}
                                placeholder="年繳方案（省 20%）"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">月繳標籤</label>
                                <Input
                                    value={props.monthlyLabel || '按月計費'}
                                    onChange={(e) => onChange({ monthlyLabel: e.target.value })}
                                    placeholder="按月計費"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">年繳標籤</label>
                                <Input
                                    value={props.yearlyLabel || '按年計費'}
                                    onChange={(e) => onChange({ yearlyLabel: e.target.value })}
                                    placeholder="按年計費"
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className="space-y-1">
                    <label className="text-xs font-medium">貨幣符號</label>
                    <Input
                        value={props.currencySymbol || 'NT$'}
                        onChange={(e) => onChange({ currencySymbol: e.target.value })}
                        placeholder="NT$"
                    />
                </div>
            </div>

            {/* 顏色設定 */}
            <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground/80">顏色設定</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium">主色調</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                value={props.primaryColor || '#6366f1'}
                                onChange={(e) => onChange({ primaryColor: e.target.value })}
                                className="w-8 h-8 rounded border cursor-pointer"
                            />
                            <Input
                                value={props.primaryColor || '#6366f1'}
                                onChange={(e) => onChange({ primaryColor: e.target.value })}
                                className="flex-1 text-xs"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium">背景色</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                value={props.backgroundColor || '#ffffff'}
                                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                                className="w-8 h-8 rounded border cursor-pointer"
                            />
                            <Input
                                value={props.backgroundColor || '#ffffff'}
                                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                                className="flex-1 text-xs"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium">文字色</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                value={props.textColor || '#333333'}
                                onChange={(e) => onChange({ textColor: e.target.value })}
                                className="w-8 h-8 rounded border cursor-pointer"
                            />
                            <Input
                                value={props.textColor || '#333333'}
                                onChange={(e) => onChange({ textColor: e.target.value })}
                                className="flex-1 text-xs"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 方案列表 */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-foreground/80">
                        方案列表 ({plans.length})
                    </h4>
                    <Button variant="outline" size="sm" onClick={addPlan}>
                        <Plus className="w-3 h-3 mr-1" /> 新增方案
                    </Button>
                </div>

                {plans.map((plan: any, index: number) => (
                    <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3 bg-muted/30"
                    >
                        {/* Plan Header */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">
                                方案 {index + 1}
                                {plan.isPopular && (
                                    <Star className="inline w-3 h-3 ml-1 text-amber-500 fill-amber-500" />
                                )}
                            </span>
                            <div className="flex items-center gap-2">
                                <label className="text-xs flex items-center gap-1 cursor-pointer">
                                    <Switch
                                        checked={plan.isPopular || false}
                                        onCheckedChange={(checked) =>
                                            updatePlan(index, 'isPopular', checked)
                                        }
                                    />
                                    <span className="text-xs">熱門</span>
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

                        {/* Plan Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium">方案名稱</label>
                            <Input
                                value={plan.name || ''}
                                onChange={(e) => updatePlan(index, 'name', e.target.value)}
                                placeholder="方案名稱"
                            />
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">月繳價格</label>
                                <Input
                                    type="number"
                                    value={plan.price || ''}
                                    onChange={(e) => updatePlan(index, 'price', e.target.value)}
                                    placeholder="99"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">年繳價格</label>
                                <Input
                                    type="number"
                                    value={plan.yearlyPrice || ''}
                                    onChange={(e) => updatePlan(index, 'yearlyPrice', e.target.value)}
                                    placeholder="79"
                                />
                            </div>
                        </div>

                        {/* Period */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium">計費週期</label>
                            <Input
                                value={plan.period || ''}
                                onChange={(e) => updatePlan(index, 'period', e.target.value)}
                                placeholder="每月"
                            />
                        </div>

                        {/* Button */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">按鈕文字</label>
                                <Input
                                    value={plan.buttonText || ''}
                                    onChange={(e) => updatePlan(index, 'buttonText', e.target.value)}
                                    placeholder="立即開始"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">按鈕連結</label>
                                <Input
                                    value={plan.href || ''}
                                    onChange={(e) => updatePlan(index, 'href', e.target.value)}
                                    placeholder="/sign-up"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium">方案描述</label>
                            <Input
                                value={plan.description || ''}
                                onChange={(e) => updatePlan(index, 'description', e.target.value)}
                                placeholder="適合個人與小型專案"
                            />
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium">功能列表</label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addFeature(index)}
                                    className="h-6 text-xs"
                                >
                                    <Plus className="w-2.5 h-2.5 mr-0.5" /> 新增
                                </Button>
                            </div>
                            {(plan.features || []).map((feature: string, fIndex: number) => (
                                <div key={fIndex} className="flex gap-1.5 items-center">
                                    <Input
                                        value={feature}
                                        onChange={(e) =>
                                            updatePlanFeature(index, fIndex, e.target.value)
                                        }
                                        className="flex-1 text-xs h-8"
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
                ))}
            </div>

            <SpacingControls
                paddingY={{
                    desktop: props.paddingYDesktop ?? 64,
                    mobile: props.paddingYMobile ?? 32,
                }}
                onChange={onChange}
            />
        </div>
    )
}
