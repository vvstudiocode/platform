import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Palette, MousePointer2, Move, Smartphone, Monitor, Type } from "lucide-react"

interface ThreadsBlockEditorProps {
    props: any
    onChange: (props: any) => void
    tenantId?: string
}

// Helper component for responsive range sliders
function ResponsiveRangeControl({
    label,
    value,
    onChange,
    min,
    max,
    step
}: {
    label: string
    value: { desktop: number; mobile: number }
    onChange: (updates: { desktop?: number; mobile?: number }) => void
    min: number
    max: number
    step: number
}) {
    const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')
    const isDesktop = mode === 'desktop'
    const currentValue = isDesktop ? value.desktop : value.mobile

    return (
        <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium text-foreground">
                        {label}
                    </Label>
                    <span className="text-[10px] px-1.5 py-0.5 bg-background rounded border border-border text-muted-foreground min-w-[2rem] text-center">
                        {currentValue}
                    </span>
                </div>
                <div className="flex bg-background rounded-lg p-0.5 border border-border">
                    <button
                        type="button"
                        onClick={() => setMode('desktop')}
                        className={`p-1.5 rounded transition-colors ${isDesktop ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        title="Desktop"
                    >
                        <Monitor className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('mobile')}
                        className={`p-1.5 rounded transition-colors ${!isDesktop ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        title="Mobile"
                    >
                        <Smartphone className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={currentValue}
                onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    onChange(isDesktop ? { desktop: val } : { mobile: val })
                }}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
            />
        </div>
    )
}

function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ] : [1, 1, 1];
}

function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (c: number) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + toHex(r) + toHex(g) + toHex(b);
}

export function ThreadsBlockEditor({ props, onChange }: ThreadsBlockEditorProps) {
    const handleChange = (key: string, value: any) => {
        onChange({ ...props, [key]: value })
    }

    // Default values if undefined
    const enableMouse = props.enableMouseInteraction !== false // default true

    // Settings
    const amplitude = props.amplitude ?? 1
    const mobileAmplitude = props.mobileAmplitude ?? amplitude

    const distance = props.distance ?? 0
    const mobileDistance = props.mobileDistance ?? distance

    const paddingYDesktop = props.paddingYDesktop ?? 0
    const paddingYMobile = props.paddingYMobile ?? 0

    // Colors
    const color = props.color ?? [1, 1, 1]
    const hexColor = rgbToHex(color[0], color[1], color[2])
    const bgColor = props.backgroundColor ?? '#000000'
    const titleColor = props.titleColor ?? '#ffffff'
    const descriptionColor = props.descriptionColor ?? '#a1a1aa'

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    內容設定
                </h3>

                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-xs text-muted-foreground">標題</Label>
                        <Input
                            id="title"
                            value={props.title || ''}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="輸入標題..."
                            className="bg-background"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs text-muted-foreground">描述</Label>
                        <Textarea
                            id="description"
                            value={props.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="輸入描述..."
                            className="bg-background min-h-[80px]"
                        />
                    </div>
                </div>

                {/* Button Settings */}
                <div className="space-y-3 pt-2">
                    <Label className="text-xs font-medium text-muted-foreground">按鈕設定</Label>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-muted-foreground">主按鈕文字</Label>
                            <Input
                                value={props.primaryButtonLabel || ''}
                                onChange={(e) => handleChange('primaryButtonLabel', e.target.value)}
                                placeholder="按鈕文字"
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-muted-foreground">主按鈕連結</Label>
                            <Input
                                value={props.primaryButtonLink || ''}
                                onChange={(e) => handleChange('primaryButtonLink', e.target.value)}
                                placeholder="/path"
                                className="h-8 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-muted-foreground">次按鈕文字</Label>
                            <Input
                                value={props.secondaryButtonLabel || ''}
                                onChange={(e) => handleChange('secondaryButtonLabel', e.target.value)}
                                placeholder="按鈕文字"
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-muted-foreground">次按鈕連結</Label>
                            <Input
                                value={props.secondaryButtonLink || ''}
                                onChange={(e) => handleChange('secondaryButtonLink', e.target.value)}
                                placeholder="/path"
                                className="h-8 text-xs font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    外觀樣式
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="bgColor" className="text-xs text-muted-foreground">背景顏色</Label>
                        <div className="flex gap-2">
                            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-input shrink-0">
                                <Input
                                    type="color"
                                    id="bgColor"
                                    value={bgColor}
                                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 cursor-pointer border-none"
                                />
                            </div>
                            <Input
                                type="text"
                                value={bgColor}
                                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                placeholder="#000000"
                                className="flex-1 font-mono uppercase text-xs h-8"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="lineColor" className="text-xs text-muted-foreground">線條顏色</Label>
                        <div className="flex gap-2">
                            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-input shrink-0">
                                <Input
                                    type="color"
                                    id="lineColor"
                                    value={hexColor}
                                    onChange={(e) => handleChange('color', hexToRgb(e.target.value))}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 cursor-pointer border-none"
                                />
                            </div>
                            <Input
                                type="text"
                                value={hexColor}
                                onChange={(e) => handleChange('color', hexToRgb(e.target.value))}
                                placeholder="#FFFFFF"
                                className="flex-1 font-mono uppercase text-xs h-8"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="titleColor" className="text-xs text-muted-foreground">標題顏色</Label>
                        <div className="flex gap-2">
                            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-input shrink-0">
                                <Input
                                    type="color"
                                    id="titleColor"
                                    value={titleColor}
                                    onChange={(e) => handleChange('titleColor', e.target.value)}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 cursor-pointer border-none"
                                />
                            </div>
                            <Input
                                type="text"
                                value={titleColor}
                                onChange={(e) => handleChange('titleColor', e.target.value)}
                                placeholder="#FFFFFF"
                                className="flex-1 font-mono uppercase text-xs h-8"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="descColor" className="text-xs text-muted-foreground">描述顏色</Label>
                        <div className="flex gap-2">
                            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-input shrink-0">
                                <Input
                                    type="color"
                                    id="descColor"
                                    value={descriptionColor}
                                    onChange={(e) => handleChange('descriptionColor', e.target.value)}
                                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 cursor-pointer border-none"
                                />
                            </div>
                            <Input
                                type="text"
                                value={descriptionColor}
                                onChange={(e) => handleChange('descriptionColor', e.target.value)}
                                placeholder="#A1A1AA"
                                className="flex-1 font-mono uppercase text-xs h-8"
                            />
                        </div>
                    </div>

                </div>

                <div className="flex items-center justify-between py-2">
                    <Label htmlFor="enableMouse" className="flex items-center gap-2 cursor-pointer text-sm font-normal">
                        <MousePointer2 className="w-4 h-4 text-muted-foreground" />
                        滑鼠互動效果
                    </Label>
                    <Switch
                        id="enableMouse"
                        checked={enableMouse}
                        onCheckedChange={(checked) => handleChange('enableMouseInteraction', checked)}
                    />
                </div>

                <div className="space-y-4">
                    <ResponsiveRangeControl
                        label="波動幅度 (Amplitude)"
                        value={{ desktop: amplitude, mobile: mobileAmplitude }}
                        onChange={({ desktop, mobile }) => {
                            if (desktop !== undefined) handleChange('amplitude', desktop)
                            if (mobile !== undefined) handleChange('mobileAmplitude', mobile)
                        }}
                        min={0}
                        max={5}
                        step={0.1}
                    />

                    <ResponsiveRangeControl
                        label="線條間距 (Distance)"
                        value={{ desktop: distance, mobile: mobileDistance }}
                        onChange={({ desktop, mobile }) => {
                            if (desktop !== undefined) handleChange('distance', desktop)
                            if (mobile !== undefined) handleChange('mobileDistance', mobile)
                        }}
                        min={-2}
                        max={2}
                        step={0.1}
                    />

                    <ResponsiveRangeControl
                        label="垂直間距 (Padding Y)"
                        value={{ desktop: paddingYDesktop, mobile: paddingYMobile }}
                        onChange={({ desktop, mobile }) => {
                            if (desktop !== undefined) handleChange('paddingYDesktop', desktop)
                            if (mobile !== undefined) handleChange('paddingYMobile', mobile)
                        }}
                        min={0}
                        max={300}
                        step={8}
                    />
                </div>
            </div>
        </div>
    )
}
