'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { ImageInput } from '../image-input'
import type { EditorProps } from '../shared/types'
import { SpacingControls } from '../responsive-controls'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Textarea } from '@/components/ui/textarea'

export function TextParallaxContentEditor({ props, onChange }: EditorProps) {
    const items = props.items || []

    const addItem = () => {
        const newItem = {
            imgUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
            subheading: "OMO 全通路整合",
            heading: "打造無縫零售體驗",
            contentTitle: "數據驅動的會員運營",
            contentDescription1: "整合線上與線下會員數據，精準描繪消費者輪廓。透過全方位的數據分析，洞察顧客需求，提供個人化的購物體驗，有效提升會員黏著度與終身價值。",
            contentDescription2: "從流量獲取到會員留存，我們提供完整的數位轉型解決方案。讓您的品牌在數位浪潮中站穩腳步，創造持續性的營收成長。",
            contentButtonText: "了解更多",
            contentButtonLink: "",
            contentBackgroundColor: "#ffffff",
            contentButtonColor: "#171717",
        }
        onChange({ items: [...items, newItem] })
    }

    const removeItem = (index: number) => {
        const newItems = items.filter((_: any, i: number) => i !== index)
        onChange({ items: newItems })
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        onChange({ items: newItems })
    }

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === items.length - 1)
        ) {
            return
        }

        const newItems = [...items]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
            ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
        onChange({ items: newItems })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>視差滾動區塊</Label>
                    <Button onClick={addItem} size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> 新增區塊
                    </Button>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-2">
                    {items.map((item: any, index: number) => (
                        <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg px-2">
                            <AccordionTrigger className="hover:no-underline py-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        {item.subheading || `區塊 ${index + 1}`}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 space-y-4">
                                <div className="flex justify-end gap-2 mb-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            moveItem(index, 'up')
                                        }}
                                        disabled={index === 0}
                                        className="h-8 w-8"
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            moveItem(index, 'down')
                                        }}
                                        disabled={index === items.length - 1}
                                        className="h-8 w-8"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive h-8 w-8"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removeItem(index)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label>背景圖片</Label>
                                    <ImageInput
                                        value={item.imgUrl}
                                        onChange={(url) => updateItem(index, 'imgUrl', url)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>副標題</Label>
                                    <Input
                                        value={item.subheading}
                                        onChange={(e) => updateItem(index, 'subheading', e.target.value)}
                                        placeholder="例如：全通路整合"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>主標題</Label>
                                    <Input
                                        value={item.heading}
                                        onChange={(e) => updateItem(index, 'heading', e.target.value)}
                                        placeholder="例如：為我們而生"
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <Label className="font-semibold">內容詳情</Label>

                                    <div className="space-y-2">
                                        <Label>內容標題</Label>
                                        <Input
                                            value={item.contentTitle || ''}
                                            onChange={(e) => updateItem(index, 'contentTitle', e.target.value)}
                                            placeholder="例如：補充說明的標題"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>描述段落 1</Label>
                                        <Textarea
                                            value={item.contentDescription1 || ''}
                                            onChange={(e) => updateItem(index, 'contentDescription1', e.target.value)}
                                            placeholder="第一段描述..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>描述段落 2</Label>
                                        <Textarea
                                            value={item.contentDescription2 || ''}
                                            onChange={(e) => updateItem(index, 'contentDescription2', e.target.value)}
                                            placeholder="第二段描述..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>按鈕文字</Label>
                                        <Input
                                            value={item.contentButtonText || ''}
                                            onChange={(e) => updateItem(index, 'contentButtonText', e.target.value)}
                                            placeholder="例如：了解更多"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>按鈕連結</Label>
                                        <Input
                                            value={item.contentButtonLink || ''}
                                            onChange={(e) => updateItem(index, 'contentButtonLink', e.target.value)}
                                            placeholder="例如：/products/new-arrival"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>背景顏色</Label>
                                            <div className="flex gap-2">
                                                <div className="relative w-8 h-8 rounded border overflow-hidden shrink-0">
                                                    <input
                                                        type="color"
                                                        value={item.contentBackgroundColor || '#ffffff'}
                                                        onChange={(e) => updateItem(index, 'contentBackgroundColor', e.target.value)}
                                                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                                                    />
                                                </div>
                                                <Input
                                                    value={item.contentBackgroundColor || ''}
                                                    onChange={(e) => updateItem(index, 'contentBackgroundColor', e.target.value)}
                                                    placeholder="#ffffff"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>按鈕顏色</Label>
                                            <div className="flex gap-2">
                                                <div className="relative w-8 h-8 rounded border overflow-hidden shrink-0">
                                                    <input
                                                        type="color"
                                                        value={item.contentButtonColor || '#000000'}
                                                        onChange={(e) => updateItem(index, 'contentButtonColor', e.target.value)}
                                                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                                                    />
                                                </div>
                                                <Input
                                                    value={item.contentButtonColor || ''}
                                                    onChange={(e) => updateItem(index, 'contentButtonColor', e.target.value)}
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        尚未新增區塊。點擊「新增區塊」開始。
                    </div>
                )}
            </div>

            <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                    <Label>組件背景顏色</Label>
                    <div className="flex gap-2">
                        <div className="relative w-8 h-8 rounded border overflow-hidden shrink-0">
                            <input
                                type="color"
                                value={props.backgroundColor || '#ffffff'}
                                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
                            />
                        </div>
                        <Input
                            value={props.backgroundColor || ''}
                            onChange={(e) => onChange({ backgroundColor: e.target.value })}
                            placeholder="例如：transparent 或 #ffffff"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">設定透明 (transparent) 可顯示頁面背景色</p>
                </div>

                <SpacingControls
                    paddingY={{
                        desktop: props.paddingYDesktop ?? 0,
                        mobile: props.paddingYMobile ?? 0
                    }}
                    onChange={onChange}
                />
            </div>
        </div>
    )
}
