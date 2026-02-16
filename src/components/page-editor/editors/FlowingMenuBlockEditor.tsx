'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import { ImageInput } from '../image-input'
import { SpacingControls } from '../responsive-controls'

interface MenuItem {
    link: string
    text: string
    image: string
}

interface FlowingMenuBlockEditorProps {
    props: {
        items?: MenuItem[]
        speed?: number
        textColor?: string
        bgColor?: string
        marqueeBgColor?: string
        marqueeTextColor?: string
        borderColor?: string
        height?: number
        paddingYDesktop?: number
        paddingYMobile?: number
    }
    onChange: (props: any) => void
    tenantId?: string
}

export function FlowingMenuBlockEditor({ props, onChange, tenantId }: FlowingMenuBlockEditorProps) {
    const items = props.items || []
    const speed = props.speed || 15
    const textColor = props.textColor || '#ffffff'
    const bgColor = props.bgColor || '#060010'
    const marqueeBgColor = props.marqueeBgColor || '#ffffff'
    const marqueeTextColor = props.marqueeTextColor || '#060010'
    const borderColor = props.borderColor || '#ffffff'
    const height = props.height || 600
    const paddingYDesktop = props.paddingYDesktop ?? 0
    const paddingYMobile = props.paddingYMobile ?? 0

    const addItem = () => {
        onChange({
            items: [
                ...items,
                {
                    link: '#',
                    text: '新項目',
                    image: 'https://picsum.photos/600/400?random=' + Date.now()
                }
            ]
        })
    }

    const removeItem = (index: number) => {
        onChange({
            items: items.filter((_, i) => i !== index)
        })
    }

    const updateItem = (index: number, field: keyof MenuItem, value: string) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        onChange({ items: newItems })
    }

    return (
        <div className="space-y-4">
            {/* 選單項目 */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm text-muted-foreground">選單項目</Label>
                    <Button onClick={addItem} size="sm" variant="outline">
                        <Plus className="h-3 w-3 mr-1" />
                        新增項目
                    </Button>
                </div>
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">項目 {index + 1}</span>
                                <Button
                                    onClick={() => removeItem(index)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">文字</Label>
                                <Input
                                    value={item.text}
                                    onChange={(e) => updateItem(index, 'text', e.target.value)}
                                    placeholder="選單文字"
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">連結</Label>
                                <Input
                                    value={item.link}
                                    onChange={(e) => updateItem(index, 'link', e.target.value)}
                                    placeholder="#"
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">圖片</Label>
                                <ImageInput
                                    value={item.image}
                                    onChange={(url) => updateItem(index, 'image', url)}
                                />
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            尚無項目,點擊上方按鈕新增
                        </p>
                    )}
                </div>
            </div>

            {/* 樣式設定 */}
            <div className="space-y-3 pt-3 border-t">
                <h4 className="text-sm font-medium">樣式設定</h4>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-xs text-muted-foreground">背景顏色</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={bgColor}
                                onChange={(e) => onChange({ bgColor: e.target.value })}
                                className="h-8 w-12 p-1"
                            />
                            <Input
                                value={bgColor}
                                onChange={(e) => onChange({ bgColor: e.target.value })}
                                className="h-8 text-sm flex-1"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">文字顏色</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={textColor}
                                onChange={(e) => onChange({ textColor: e.target.value })}
                                className="h-8 w-12 p-1"
                            />
                            <Input
                                value={textColor}
                                onChange={(e) => onChange({ textColor: e.target.value })}
                                className="h-8 text-sm flex-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-xs text-muted-foreground">跑馬燈背景</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={marqueeBgColor}
                                onChange={(e) => onChange({ marqueeBgColor: e.target.value })}
                                className="h-8 w-12 p-1"
                            />
                            <Input
                                value={marqueeBgColor}
                                onChange={(e) => onChange({ marqueeBgColor: e.target.value })}
                                className="h-8 text-sm flex-1"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">跑馬燈文字</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={marqueeTextColor}
                                onChange={(e) => onChange({ marqueeTextColor: e.target.value })}
                                className="h-8 w-12 p-1"
                            />
                            <Input
                                value={marqueeTextColor}
                                onChange={(e) => onChange({ marqueeTextColor: e.target.value })}
                                className="h-8 text-sm flex-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-xs text-muted-foreground">邊框顏色</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={borderColor}
                                onChange={(e) => onChange({ borderColor: e.target.value })}
                                className="h-8 w-12 p-1"
                            />
                            <Input
                                value={borderColor}
                                onChange={(e) => onChange({ borderColor: e.target.value })}
                                className="h-8 text-sm flex-1"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">動畫速度 (秒)</Label>
                        <Input
                            type="number"
                            value={speed}
                            onChange={(e) => onChange({ speed: parseFloat(e.target.value) || 15 })}
                            min="1"
                            max="60"
                            step="1"
                            className="h-8 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <Label className="text-xs text-muted-foreground">高度 (px)</Label>
                    <Input
                        type="number"
                        value={height}
                        onChange={(e) => onChange({ height: parseInt(e.target.value) || 600 })}
                        min="300"
                        max="1200"
                        step="50"
                        className="h-8 text-sm"
                    />
                </div>

                <SpacingControls
                    paddingY={{ desktop: paddingYDesktop, mobile: paddingYMobile }}
                    onChange={({ paddingYDesktop, paddingYMobile }) => {
                        const updates: any = {}
                        if (paddingYDesktop !== undefined) updates.paddingYDesktop = paddingYDesktop
                        if (paddingYMobile !== undefined) updates.paddingYMobile = paddingYMobile
                        onChange(updates)
                    }}
                />
            </div>
        </div>
    )
}
