import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlignLeft, AlignCenter, AlignRight, Monitor, Smartphone, Play, Plus, X } from 'lucide-react'
import type { EditorProps } from '../shared/types'
import { SpacingControls } from '../responsive-controls'

export function RotatingTextEditor({ props, onChange }: EditorProps) {
    const [fontSizeMode, setFontSizeMode] = useState<'desktop' | 'mobile'>('desktop')

    const fontWeights = [
        { value: 400, label: '正常' },
        { value: 600, label: '粗體' },
        { value: 700, label: '加粗' },
        { value: 900, label: '超粗' }
    ]

    const handleAddText = () => {
        const currentTexts = props.texts || ['is very good', 'is amazing', 'is powerful'];
        onChange({ texts: [...currentTexts, 'New Text'] });
    }

    const handleRemoveText = (index: number) => {
        const currentTexts = props.texts || [];
        if (currentTexts.length <= 1) return;
        const newTexts = [...currentTexts];
        newTexts.splice(index, 1);
        onChange({ texts: newTexts });
    }

    const handleTextChange = (index: number, value: string) => {
        const currentTexts = props.texts || [];
        const newTexts = [...currentTexts];
        newTexts[index] = value;
        onChange({ texts: newTexts });
    }

    return (
        <div className="space-y-4">
            {/* 文字內容 */}
            <div>
                <div className="mb-4">
                    <Label className="text-xs text-muted-foreground mb-1 block">前綴固定文字</Label>
                    <input
                        value={props.prefix || ''}
                        onChange={(e) => onChange({ prefix: e.target.value })}
                        placeholder="例如: OMO網站平台"
                        className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>

                <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs text-muted-foreground">輪替文字</Label>
                    <Button variant="outline" size="sm" onClick={handleAddText} className="h-6 w-6 p-0 rounded-full">
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
                <div className="space-y-2">
                    {(props.texts || ['is very good', 'is amazing', 'is powerful']).map((text: string, index: number) => (
                        <div key={index} className="flex gap-2">
                            <input
                                value={text}
                                onChange={(e) => handleTextChange(index, e.target.value)}
                                className="flex-1 h-8 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveText(index)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                disabled={(props.texts?.length || 0) <= 1}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 顏色設定 */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs text-muted-foreground">文字顏色</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="relative w-full h-8 rounded overflow-hidden border border-input cursor-pointer">
                            <input
                                type="color"
                                value={props.color || '#000000'}
                                onChange={(e) => onChange({ color: e.target.value })}
                                className="absolute top-0 left-0 w-full h-full p-0 border-none cursor-pointer"
                                style={{ transform: 'scale(1.5)' }} // Ensure it covers the container
                            />
                        </div>
                    </div>
                    <input
                        type="text"
                        value={props.color || '#000000'}
                        onChange={(e) => onChange({ color: e.target.value })}
                        className="w-full h-8 mt-2 text-xs px-2 border border-input rounded bg-background"
                    />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">背景顏色</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="relative w-full h-8 rounded overflow-hidden border border-input cursor-pointer">
                            <input
                                type="color"
                                value={props.backgroundColor || '#cyan-300'}
                                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                                className="absolute top-0 left-0 w-full h-full p-0 border-none cursor-pointer"
                                style={{ transform: 'scale(1.5)' }} // Ensure it covers the container
                            />
                        </div>
                    </div>
                    <input
                        type="text"
                        value={props.backgroundColor || '#cyan-300'}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                        className="w-full h-8 mt-2 text-xs px-2 border border-input rounded bg-background"
                    />
                </div>
            </div>

            {/* 動畫設定 */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Play className="w-3 h-3" /> 動畫參數
                </Label>

                <div>
                    <div className="flex justify-between mb-1">
                        <Label className="text-xs text-muted-foreground">輪替間隔 (毫秒): {props.rotationInterval || 2000}ms</Label>
                    </div>
                    <input
                        type="range"
                        min="500"
                        max="5000"
                        step="100"
                        value={props.rotationInterval || 2000}
                        onChange={(e) => onChange({ rotationInterval: Number(e.target.value) })}
                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                    />
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
