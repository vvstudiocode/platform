import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlignLeft, AlignCenter, AlignRight, Monitor, Smartphone, Play } from 'lucide-react'
import type { EditorProps } from '../shared/types'
import { SpacingControls } from '../responsive-controls'

export function ShinyTextEditor({ props, onChange }: EditorProps) {
    const [fontSizeMode, setFontSizeMode] = useState<'desktop' | 'mobile'>('desktop')

    const fontWeights = [
        { value: 400, label: '正常' },
        { value: 600, label: '粗體' },
        { value: 700, label: '加粗' },
        { value: 900, label: '超粗' }
    ]

    return (
        <div className="space-y-4">
            {/* 文字內容 */}
            <div>
                <Label className="text-xs text-muted-foreground">文字內容</Label>
                <textarea
                    value={props.text || ''}
                    onChange={(e) => onChange({ text: e.target.value })}
                    placeholder="輸入文字..."
                    className="mt-1 min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={3}
                />
            </div>

            {/* 顏色設定 */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs text-muted-foreground">文字顏色</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="relative w-10 h-10 rounded overflow-hidden border border-input">
                            <input
                                type="color"
                                value={props.color || '#b5b5b5'}
                                onChange={(e) => onChange({ color: e.target.value })}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-none"
                            />
                        </div>
                        <input
                            type="text"
                            value={props.color || '#b5b5b5'}
                            onChange={(e) => onChange({ color: e.target.value })}
                            className="flex-1 h-10 text-xs px-2 border border-input rounded bg-background"
                        />
                    </div>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">閃光顏色</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="relative w-10 h-10 rounded overflow-hidden border border-input">
                            <input
                                type="color"
                                value={props.shineColor || '#ffffff'}
                                onChange={(e) => onChange({ shineColor: e.target.value })}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-none"
                            />
                        </div>
                        <input
                            type="text"
                            value={props.shineColor || '#ffffff'}
                            onChange={(e) => onChange({ shineColor: e.target.value })}
                            className="flex-1 h-10 text-xs px-2 border border-input rounded bg-background"
                        />
                    </div>
                </div>
            </div>

            {/* 動畫設定 */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Play className="w-3 h-3" /> 動畫參數
                </Label>

                <div>
                    <div className="flex justify-between mb-1">
                        <Label className="text-xs text-muted-foreground">速度 (秒): {props.speed || 2}s</Label>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="5"
                        step="0.1"
                        value={props.speed || 2}
                        onChange={(e) => onChange({ speed: Number(e.target.value) })}
                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <Label className="text-xs text-muted-foreground">擴散範圍: {props.spread || 120}°</Label>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={props.spread || 120}
                        onChange={(e) => onChange({ spread: Number(e.target.value) })}
                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={props.disabled || false}
                            onChange={(e) => onChange({ disabled: e.target.checked })}
                            id="disabled-mode"
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="disabled-mode" className="text-xs cursor-pointer">停用動畫</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={props.pauseOnHover || false}
                            onChange={(e) => onChange({ pauseOnHover: e.target.checked })}
                            id="hover-pause"
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="hover-pause" className="text-xs cursor-pointer">懸停暫停</Label>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={props.yoyo || false}
                            onChange={(e) => onChange({ yoyo: e.target.checked })}
                            id="yoyo-mode"
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="yoyo-mode" className="text-xs cursor-pointer">來回播放 (Yoyo)</Label>
                    </div>
                </div>
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
                            onChange={(e) => onChange({ fontSizeDesktop: Number(e.target.value) })}
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
                            onChange={(e) => onChange({ fontSizeMobile: Number(e.target.value) })}
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                        />
                    </div>
                )}
            </div>

            {/* 字體粗細與對齊 */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">字體粗細</Label>
                    <select
                        className="w-full h-9 text-xs border rounded bg-background px-2"
                        value={props.fontWeight || 400}
                        onChange={(e) => onChange({ fontWeight: Number(e.target.value) })}
                    >
                        {fontWeights.map(w => (
                            <option key={w.value} value={w.value}>{w.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">對齊方式</Label>
                    <div className="flex gap-1">
                        {[
                            { value: 'left', icon: AlignLeft },
                            { value: 'center', icon: AlignCenter },
                            { value: 'right', icon: AlignRight }
                        ].map(({ value, icon: Icon }) => (
                            <Button
                                key={value}
                                type="button"
                                variant={props.textAlign === value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onChange({ textAlign: value })}
                                className="flex-1 px-0"
                            >
                                <Icon className="h-4 w-4" />
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 間距設定 */}
            <SpacingControls
                paddingY={{
                    desktop: props.paddingYDesktop ?? 64,
                    mobile: props.paddingYMobile ?? 32
                }}
                onChange={(updates) => onChange(updates)}
            />
        </div>
    )
}
