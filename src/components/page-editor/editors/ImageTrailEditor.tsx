'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditorProps } from "../shared/types"
import { SpacingControls } from "../responsive-controls"
import { ImageInput } from "../image-input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Image as ImageIcon } from "lucide-react"

interface Props extends EditorProps {
    tenantId?: string
}

export function ImageTrailEditor({ props, onChange, tenantId }: Props) {
    const {
        images = [],
        variant = 1,
        height = 500,
        backgroundColor = "transparent",
        paddingYDesktop = 0,
        paddingYMobile = 0
    } = props || {}

    const handleChange = (key: string, value: any) => {
        onChange({
            ...props,
            [key]: value
        })
    }

    const addImage = () => {
        const newImages = [...images, '']
        handleChange('images', newImages)
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_: string, i: number) => i !== index)
        handleChange('images', newImages)
    }

    const updateImage = (index: number, value: string) => {
        const newImages = [...images]
        newImages[index] = value
        handleChange('images', newImages)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>圖片列表</Label>
                    <span className="text-xs text-muted-foreground">
                        ({images.length}/15)
                    </span>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {images.map((img: string, index: number) => (
                        <div
                            key={index}
                            className="flex gap-2 items-start bg-muted/30 p-2 rounded-lg relative group"
                        >
                            <div className="flex-1">
                                <ImageInput
                                    value={img}
                                    onChange={(value) => updateImage(index, value)}
                                    placeholder="圖片網址"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-1.5 text-muted-foreground hover:text-destructive mt-1"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {images.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border text-sm">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            尚無圖片,請點擊下方按鈕新增
                        </div>
                    )}
                </div>

                {images.length < 15 ? (
                    <button
                        type="button"
                        onClick={addImage}
                        className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        新增圖片
                    </button>
                ) : (
                    <div className="text-center text-xs text-amber-500 font-medium py-2">
                        已達圖片上限 (15張)
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label>動畫變體</Label>
                <Select
                    value={String(variant)}
                    onValueChange={(val: string) => handleChange('variant', Number(val))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="選擇動畫效果" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">變體 1 - 基本淡出</SelectItem>
                        <SelectItem value="2">變體 2 - 縮放淡出</SelectItem>
                        <SelectItem value="3">變體 3 - 向上飛出</SelectItem>
                        <SelectItem value="4">變體 4 - 方向飛出</SelectItem>
                        <SelectItem value="5">變體 5 - 旋轉飛出</SelectItem>
                        <SelectItem value="6">變體 6 - 速度效果</SelectItem>
                        <SelectItem value="7">變體 7 - 多圖堆疊</SelectItem>
                        <SelectItem value="8">變體 8 - 3D 透視</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>容器高度 ({height}px)</Label>
                <Input
                    type="number"
                    min={200}
                    max={1000}
                    value={height}
                    onChange={(e) => handleChange('height', Number(e.target.value))}
                />
            </div>

            <div className="space-y-2">
                <Label>背景顏色</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={backgroundColor === "transparent" ? "#ffffff" : backgroundColor}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                        className="flex-1"
                        placeholder="transparent"
                    />
                </div>
            </div>

            <SpacingControls
                paddingY={{ desktop: paddingYDesktop, mobile: paddingYMobile }}
                onChange={({ paddingYDesktop, paddingYMobile }) => {
                    const updates: any = {}
                    if (paddingYDesktop !== undefined) updates.paddingYDesktop = paddingYDesktop
                    if (paddingYMobile !== undefined) updates.paddingYMobile = paddingYMobile
                    onChange({ ...props, ...updates })
                }}
            />
        </div>
    )
}
