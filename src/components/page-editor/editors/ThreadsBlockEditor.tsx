import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Palette, MousePointer2, Smartphone, Monitor, Type } from "lucide-react"
import { SpacingControls, FontSizeControls } from "../responsive-controls"
import type { EditorProps } from "../shared/types"

// Helper component for responsive range sliders
function ResponsiveSlider({
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
                        title="桌面版"
                    >
                        <Monitor className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('mobile')}
                        className={`p-1.5 rounded transition-colors ${!isDesktop ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        title="手機版"
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
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
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

export function ThreadsBlockEditor({ props, onChange }: EditorProps) {
    const handleChange = (key: string, value: any) => {
        onChange({ [key]: value })
    }

    const color = props.color ?? [1, 1, 1]
    const hexColor = rgbToHex(color[0], color[1], color[2])

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    內容設定
                </h3>

                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">標題</Label>
                        <Input
                            value={props.title || ''}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="輸入標題..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">描述</Label>
                        <Textarea
                            value={props.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="輸入描述..."
                            className="min-h-[80px]"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <FontSizeControls
                        label="標題字體大小"
                        fontSize={{
                            desktop: props.fontSizeDesktop ?? 60,
                            mobile: props.fontSizeMobile ?? 36
                        }}
                        onChange={onChange}
                        min={12}
                        max={120}
                    />
                </div>

                <div className="space-y-4 pt-2">
                    <Label className="text-xs font-medium text-muted-foreground">按鈕設定</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-muted-foreground">主按鈕文字</Label>
                            <Input
                                value={props.primaryButtonLabel || ''}
                                onChange={(e) => handleChange('primaryButtonLabel', e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-muted-foreground">主按鈕連結</Label>
                            <Input
                                value={props.primaryButtonLink || ''}
                                onChange={(e) => handleChange('primaryButtonLink', e.target.value)}
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
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-muted-foreground">次按鈕連結</Label>
                            <Input
                                value={props.secondaryButtonLink || ''}
                                onChange={(e) => handleChange('secondaryButtonLink', e.target.value)}
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
                        <Label className="text-xs text-muted-foreground">背景顏色</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={props.backgroundColor || '#000000'}
                                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                className="w-8 h-8 p-0 cursor-pointer border-none shrink-0 rounded"
                            />
                            <Input
                                value={props.backgroundColor || '#000000'}
                                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                className="flex-1 font-mono uppercase text-[10px] h-8"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">線條顏色</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={hexColor}
                                onChange={(e) => handleChange('color', hexToRgb(e.target.value))}
                                className="w-8 h-8 p-0 cursor-pointer border-none shrink-0 rounded"
                            />
                            <Input
                                value={hexColor}
                                onChange={(e) => handleChange('color', hexToRgb(e.target.value))}
                                className="flex-1 font-mono uppercase text-[10px] h-8"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">標題顏色</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={props.titleColor || '#ffffff'}
                                onChange={(e) => handleChange('titleColor', e.target.value)}
                                className="w-8 h-8 p-0 cursor-pointer border-none shrink-0 rounded"
                            />
                            <Input
                                value={props.titleColor || '#ffffff'}
                                onChange={(e) => handleChange('titleColor', e.target.value)}
                                className="flex-1 font-mono uppercase text-[10px] h-8"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">描述顏色</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={props.descriptionColor || '#a1a1aa'}
                                onChange={(e) => handleChange('descriptionColor', e.target.value)}
                                className="w-8 h-8 p-0 cursor-pointer border-none shrink-0 rounded"
                            />
                            <Input
                                value={props.descriptionColor || '#a1a1aa'}
                                onChange={(e) => handleChange('descriptionColor', e.target.value)}
                                className="flex-1 font-mono uppercase text-[10px] h-8"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-border/50">
                    <Label className="flex items-center gap-2 cursor-pointer text-xs font-normal">
                        <MousePointer2 className="w-3.5 h-3.5 text-muted-foreground" />
                        滑鼠互動效果
                    </Label>
                    <Switch
                        checked={props.enableMouseInteraction !== false}
                        onCheckedChange={(checked) => handleChange('enableMouseInteraction', checked)}
                    />
                </div>

                <div className="space-y-4">
                    <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-foreground">
                                動畫水平位置 (Center X)
                            </Label>
                            <span className="text-[10px] px-1.5 py-0.5 bg-background rounded border border-border text-muted-foreground min-w-[2.5rem] text-center">
                                {props.centerX ?? 0.5}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={props.centerX ?? 0.5}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onChange={(e) => handleChange('centerX', parseFloat(e.target.value))}
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                        />
                    </div>

                    <ResponsiveSlider
                        label="波動幅度 (Amplitude)"
                        value={{
                            desktop: props.amplitude ?? 1,
                            mobile: props.mobileAmplitude ?? (props.amplitude ?? 1)
                        }}
                        onChange={({ desktop, mobile }) => {
                            if (desktop !== undefined) handleChange('amplitude', desktop)
                            if (mobile !== undefined) handleChange('mobileAmplitude', mobile)
                        }}
                        min={0}
                        max={5}
                        step={0.1}
                    />

                    <ResponsiveSlider
                        label="線條間距 (Distance)"
                        value={{
                            desktop: props.distance ?? 0,
                            mobile: props.mobileDistance ?? (props.distance ?? 0)
                        }}
                        onChange={({ desktop, mobile }) => {
                            if (desktop !== undefined) handleChange('distance', desktop)
                            if (mobile !== undefined) handleChange('mobileDistance', mobile)
                        }}
                        min={-2}
                        max={2}
                        step={0.1}
                    />

                    <SpacingControls
                        paddingY={{
                            desktop: props.paddingYDesktop ?? 0,
                            mobile: props.paddingYMobile ?? 0
                        }}
                        onChange={onChange}
                    />
                </div>
            </div>
        </div>
    )
}
