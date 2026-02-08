'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlignLeft, AlignCenter, AlignRight, Monitor, Smartphone } from 'lucide-react'
import type { EditorProps } from '../shared/types'
import { SpacingControls } from '../responsive-controls'

export function AnimatedTextEditor({ props, onChange }: EditorProps) {
    const [fontSizeMode, setFontSizeMode] = useState<'desktop' | 'mobile'>('desktop')

    const animationTypes = [
        { value: 'fade-in', label: '淡入' },
        { value: 'slide-up', label: '上滑' },
        { value: 'split-chars', label: '字元飛入' },
        { value: 'wave', label: '波浪' },
        { value: 'typewriter', label: '打字機' }
    ]

    const fontWeights = [
        { value: 400, label: '正常' },
        { value: 600, label: '粗體' },
        { value: 700, label: '加粗' },
        { value: 900, label: '超粗' }
    ]

    const heights = [
        { value: 'auto', label: '自動' },
        { value: '50vh', label: '50%' },
        { value: '60vh', label: '60%' },
        { value: '70vh', label: '70%' },
        { value: '80vh', label: '80%' },
        { value: '100vh', label: '全螢幕' }
    ]

    // Trigger animation replay by updating a key
    const handleAnimationTypeChange = (type: string) => {
        onChange({
            animationType: type,
            animationKey: Date.now() // This triggers re-render and replay
        })
    }

    return (
        <div className="space-y-4">
            {/* 文字內容 - 改為 Textarea 支援換行 */}
            <div>
                <Label className="text-xs text-muted-foreground">文字內容 (可換行)</Label>
                <textarea
                    value={props.text || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ text: e.target.value })}
                    placeholder="輸入要顯示的文字...&#10;按 Enter 可換行"
                    className="mt-1 min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    rows={3}
                />
            </div>

            {/* 動畫類型 - 點擊時重播動畫 */}
            <div>
                <Label className="text-xs text-muted-foreground">動畫效果 (點擊可預覽)</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                    {animationTypes.map((type) => (
                        <Button
                            key={type.value}
                            type="button"
                            variant={props.animationType === type.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleAnimationTypeChange(type.value)}
                            className="text-xs"
                        >
                            {type.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* 字體大小 - 分開電腦/手機 */}
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
                            <span>{props.fontSizeDesktop || 8}vw</span>
                        </div>
                        <input
                            type="range"
                            min="3"
                            max="15"
                            step="0.5"
                            value={props.fontSizeDesktop || 8}
                            onChange={(e) => onChange({ fontSizeDesktop: Number(e.target.value) })}
                            className="w-full"
                        />
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>{props.fontSizeMobile || 10}vw</span>
                        </div>
                        <input
                            type="range"
                            min="4"
                            max="20"
                            step="0.5"
                            value={props.fontSizeMobile || 10}
                            onChange={(e) => onChange({ fontSizeMobile: Number(e.target.value) })}
                            className="w-full"
                        />
                    </div>
                )}
            </div>

            {/* 字體粗細 */}
            <div>
                <Label className="text-xs text-muted-foreground">字體粗細</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                    {fontWeights.map((weight) => (
                        <Button
                            key={weight.value}
                            type="button"
                            variant={props.fontWeight === weight.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onChange({ fontWeight: weight.value })}
                            className="text-xs"
                        >
                            {weight.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* 顏色設定 */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs text-muted-foreground">文字顏色</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="relative w-10 h-10 rounded overflow-hidden border border-input">
                            <input
                                type="color"
                                value={props.textColor || '#1C1C1C'}
                                onChange={(e) => onChange({ textColor: e.target.value })}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-none"
                            />
                        </div>
                        <input
                            type="text"
                            value={props.textColor || '#1C1C1C'}
                            onChange={(e) => onChange({ textColor: e.target.value })}
                            className="flex-1 h-10 text-xs px-2 border border-input rounded bg-background"
                        />
                    </div>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">背景顏色</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="relative w-10 h-10 rounded overflow-hidden border border-input">
                            <input
                                type="color"
                                value={props.backgroundColor || '#FED75A'}
                                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-none"
                            />
                        </div>
                        <input
                            type="text"
                            value={props.backgroundColor || '#FED75A'}
                            onChange={(e) => onChange({ backgroundColor: e.target.value })}
                            className="flex-1 h-10 text-xs px-2 border border-input rounded bg-background"
                        />
                    </div>
                </div>
            </div>

            {/* 文字對齊 */}
            <div>
                <Label className="text-xs text-muted-foreground">文字對齊</Label>
                <div className="flex gap-2 mt-1">
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
                        >
                            <Icon className="h-4 w-4" />
                        </Button>
                    ))}
                </div>
            </div>

            {/* 區塊高度 */}
            <div>
                <Label className="text-xs text-muted-foreground">區塊高度</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                    {heights.map((h) => (
                        <Button
                            key={h.value}
                            type="button"
                            variant={props.height === h.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onChange({ height: h.value })}
                            className="text-xs"
                        >
                            {h.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* 動畫參數 */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs text-muted-foreground">動畫時長 (秒): {props.animationDuration || 1}</Label>
                    <input
                        type="range"
                        min="0.3"
                        max="3"
                        step="0.1"
                        value={props.animationDuration || 1}
                        onChange={(e) => onChange({ animationDuration: Number(e.target.value) })}
                        className="w-full mt-1"
                    />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">字元延遲 (秒): {props.animationDelay || 0.05}</Label>
                    <input
                        type="range"
                        min="0.01"
                        max="0.2"
                        step="0.01"
                        value={props.animationDelay || 0.05}
                        onChange={(e) => onChange({ animationDelay: Number(e.target.value) })}
                        className="w-full mt-1"
                    />
                </div>
            </div>

            {/* 上下間距 */}
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
