import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Palette, Play, Maximize, Type, AlignLeft, AlignCenter, AlignRight, Monitor, Smartphone } from 'lucide-react'
import { SpacingControls } from '../responsive-controls'
import { useState } from 'react'

interface GradientTextEditorProps {
    props: Record<string, any>
    onChange: (props: Record<string, any>) => void
}

export function GradientTextEditor({ props, onChange }: GradientTextEditorProps) {
    const [fontSizeMode, setFontSizeMode] = useState<'desktop' | 'mobile'>('desktop')

    const handleColorChange = (index: number, value: string) => {
        const newColors = [...(props.colors || ['#5227FF', '#FF9FFC', '#B19EEF'])]
        newColors[index] = value
        onChange({ ...props, colors: newColors })
    }

    const addColor = () => {
        const newColors = [...(props.colors || ['#5227FF']), '#ffffff']
        onChange({ ...props, colors: newColors })
    }

    const removeColor = (index: number) => {
        const newColors = [...(props.colors || [])]
        newColors.splice(index, 1)
        onChange({ ...props, colors: newColors })
    }

    return (
        <div className="space-y-6">
            {/* 文字內容設定 */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Type className="h-4 w-4 text-primary" />
                    <span className="font-medium">文字設定</span>
                </div>

                <div className="space-y-2">
                    <Label>文字內容</Label>
                    <Input
                        value={props.text || ''}
                        onChange={(e) => onChange({ ...props, text: e.target.value })}
                        placeholder="輸入文字..."
                    />
                </div>

                {/* 字體大小 */}
                <div className="space-y-2 bg-muted/50 p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground">
                            字體大小
                        </Label>
                        <div className="flex items-center gap-1 bg-background rounded border border-border">
                            <button
                                type="button"
                                onClick={() => setFontSizeMode('desktop')}
                                className={`p-1.5 rounded transition-colors ${fontSizeMode === 'desktop'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                title="桌面版"
                            >
                                <Monitor className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setFontSizeMode('mobile')}
                                className={`p-1.5 rounded transition-colors ${fontSizeMode === 'mobile'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                title="手機版"
                            >
                                <Smartphone className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {fontSizeMode === 'desktop' ? (
                        <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>{props.fontSizeDesktop || 16}px</span>
                            </div>
                            <input
                                type="range"
                                min="12"
                                max="100"
                                step="1"
                                value={props.fontSizeDesktop || 16}
                                onChange={(e) => onChange({ ...props, fontSizeDesktop: Number(e.target.value) })}
                                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                            />
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>{props.fontSizeMobile || 14}px</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="60"
                                step="1"
                                value={props.fontSizeMobile || 14}
                                onChange={(e) => onChange({ ...props, fontSizeMobile: Number(e.target.value) })}
                                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>對齊方式</Label>
                    <div className="flex gap-1">
                        {[
                            { value: 'left', icon: AlignLeft },
                            { value: 'center', icon: AlignCenter },
                            { value: 'right', icon: AlignRight },
                        ].map((align) => {
                            const Icon = align.icon
                            return (
                                <Button
                                    key={align.value}
                                    type="button"
                                    variant={props.textAlign === align.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onChange({ ...props, textAlign: align.value })}
                                    className="flex-1 px-0"
                                >
                                    <Icon className="h-4 w-4" />
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* 動畫設定 */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Play className="h-4 w-4 text-primary" />
                    <span className="font-medium">動畫設定</span>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>動畫速度</Label>
                            <span className="text-xs text-muted-foreground">{props.animationSpeed || 8}s</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            step="0.5"
                            value={props.animationSpeed || 8}
                            onChange={(e) => onChange({ ...props, animationSpeed: Number(e.target.value) })}
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>漸層方向</Label>
                        <Select
                            value={props.direction || 'horizontal'}
                            onValueChange={(value) => onChange({ ...props, direction: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="horizontal">水平 (Horizontal)</SelectItem>
                                <SelectItem value="vertical">垂直 (Vertical)</SelectItem>
                                <SelectItem value="diagonal">對角 (Diagonal)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>顯示邊框</Label>
                        <Switch
                            checked={props.showBorder || false}
                            onCheckedChange={(checked) => onChange({ ...props, showBorder: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>往返動畫 (Yoyo)</Label>
                        <Switch
                            checked={props.yoyo !== false}
                            onCheckedChange={(checked) => onChange({ ...props, yoyo: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>懸停暫停</Label>
                        <Switch
                            checked={props.pauseOnHover || false}
                            onCheckedChange={(checked) => onChange({ ...props, pauseOnHover: checked })}
                        />
                    </div>
                </div>
            </div>

            {/* 顏色設定 */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Palette className="h-4 w-4 text-primary" />
                    <span className="font-medium">漸層顏色</span>
                </div>

                <div className="space-y-3">
                    {(props.colors || ['#5227FF', '#FF9FFC', '#B19EEF']).map((color: string, index: number) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                type="color"
                                value={color}
                                onChange={(e) => handleColorChange(index, e.target.value)}
                                className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={color}
                                onChange={(e) => handleColorChange(index, e.target.value)}
                                className="flex-1"
                            />
                            <button
                                onClick={() => removeColor(index)}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addColor} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        新增顏色
                    </Button>
                </div>
            </div>

            {/* 間距設定 */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Maximize className="h-4 w-4 text-primary" />
                    <span className="font-medium">間距設定</span>
                </div>

                <SpacingControls
                    paddingY={{
                        desktop: props.paddingYDesktop ?? 64,
                        mobile: props.paddingYMobile ?? 32
                    }}
                    onChange={(updates) => onChange({
                        ...props,
                        ...updates
                    })}
                />
            </div>
        </div>
    )
}


function Plus({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}

function X({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
} 
