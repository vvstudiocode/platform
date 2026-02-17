// 圖片網格編輯器
import { Trash2, ChevronDown, ChevronUp, Monitor, Smartphone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SpacingControls, ImageControls, AspectRatioControls } from '../responsive-controls'
import { AnimationControls } from '../animation-controls'
import { ImageInput } from '../image-input'
import { useListEditor } from '../shared/useListEditor'
import type { EditorProps } from '../shared/types'
import { useState } from 'react'

// 裝置切換元件
function DeviceToggles({ mode, setMode }: {
    mode: 'desktop' | 'mobile'
    setMode: (mode: 'desktop' | 'mobile') => void
}) {
    return (
        <div className="inline-flex items-center gap-1 p-0.5 bg-muted rounded-md border border-border">
            <button
                type="button"
                onClick={() => setMode('desktop')}
                className={`p-1 rounded transition-colors ${mode === 'desktop'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
            >
                <Monitor className="w-3 h-3" />
            </button>
            <button
                type="button"
                onClick={() => setMode('mobile')}
                className={`p-1 rounded transition-colors ${mode === 'mobile'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
            >
                <Smartphone className="w-3 h-3" />
            </button>
        </div>
    )
}

export function ImageGridEditor({ props, onChange }: EditorProps) {
    const { add, remove, update, items: images } = useListEditor(
        props.images || [],
        'images',
        onChange
    )
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
    const [columnMode, setColumnMode] = useState<'desktop' | 'mobile'>('desktop')
    const [gapMode, setGapMode] = useState<'desktop' | 'mobile'>('desktop')

    return (
        <div className="space-y-3">
            {/* 響應式欄位控制 - 拉桿樣式 */}
            <div className="space-y-2 bg-muted/50 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground">
                        欄位數
                    </Label>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-background rounded border border-border text-muted-foreground min-w-[3rem] text-center">
                            {columnMode === 'desktop' ? (props.columnsDesktop ?? props.columns ?? 3) : (props.columnsMobile ?? 1)} 欄
                        </span>
                        <DeviceToggles mode={columnMode} setMode={setColumnMode} />
                    </div>
                </div>
                <input
                    type="range"
                    min="1"
                    max={columnMode === 'desktop' ? "6" : "3"}
                    step="1"
                    value={columnMode === 'desktop' ? (props.columnsDesktop ?? props.columns ?? 3) : (props.columnsMobile ?? 1)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        const val = parseInt(e.target.value)
                        onChange(columnMode === 'desktop' ? { columnsDesktop: val } : { columnsMobile: val })
                    }}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                />
            </div>

            {/* 響應式間距控制 - 拉桿樣式 */}
            <div className="space-y-2 bg-muted/50 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground">
                        間距
                    </Label>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-background rounded border border-border text-muted-foreground min-w-[3rem] text-center">
                            {gapMode === 'desktop' ? (props.gapDesktop ?? props.gap ?? 16) : (props.gapMobile ?? 16)}px
                        </span>
                        <DeviceToggles mode={gapMode} setMode={setGapMode} />
                    </div>
                </div>
                <input
                    type="range"
                    min="0"
                    max="64"
                    step="4"
                    value={gapMode === 'desktop' ? (props.gapDesktop ?? props.gap ?? 16) : (props.gapMobile ?? 16)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        const val = parseInt(e.target.value)
                        onChange(gapMode === 'desktop' ? { gapDesktop: val } : { gapMobile: val })
                    }}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                />
            </div>

            {/* 圖片列表 */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">圖片列表</label>
                {images.map((img: any, index: number) => {
                    const isExpanded = expandedIndex === index
                    return (
                        <div key={index} className="border border-input rounded-lg overflow-hidden">
                            {/* 圖片基本資訊 */}
                            <div className="p-3 bg-muted/30 space-y-2">
                                <ImageInput
                                    value={img.url || ''}
                                    onChange={(url) => update(index, 'url', url)}
                                    placeholder="圖片 URL"
                                />
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1">
                                        <Input placeholder="圖片說明" value={img.alt || ''} onChange={(e) => update(index, 'alt', e.target.value)} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                        className="p-2 text-muted-foreground hover:text-foreground"
                                        title={isExpanded ? "收起進階設定" : "展開進階設定"}
                                    >
                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                    <button type="button" onClick={() => remove(index)} className="p-2 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <Input placeholder="連結 (可選)" value={img.link || ''} onChange={(e) => update(index, 'link', e.target.value)} />
                            </div>

                            {/* 進階設定 - 文字覆蓋層和遮罩 */}
                            {isExpanded && (
                                <div className="p-3 bg-muted/50 border-t border-input space-y-3">
                                    {/* 文字覆蓋層 */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-muted-foreground">文字覆蓋層</label>
                                        <textarea
                                            placeholder="覆蓋文字 (可選,支援多行)"
                                            value={img.text || ''}
                                            onChange={(e) => update(index, 'text', e.target.value)}
                                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                            rows={2}
                                        />

                                        {img.text && (
                                            <>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-muted-foreground mb-1">文字大小 (px)</label>
                                                        <Input
                                                            type="number"
                                                            min="8"
                                                            max="72"
                                                            value={img.textSize ?? 16}
                                                            onChange={(e) => update(index, 'textSize', parseInt(e.target.value) || 16)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-muted-foreground mb-1">文字顏色</label>
                                                        <div className="flex gap-1">
                                                            <Input
                                                                type="color"
                                                                value={img.textColor || '#ffffff'}
                                                                onChange={(e) => update(index, 'textColor', e.target.value)}
                                                                className="w-10 h-9 p-1 cursor-pointer"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={img.textColor || '#ffffff'}
                                                                onChange={(e) => update(index, 'textColor', e.target.value)}
                                                                placeholder="#ffffff"
                                                                className="flex-1 text-xs"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-muted-foreground mb-1">垂直對齊</label>
                                                        <select
                                                            value={img.textVerticalAlign || 'center'}
                                                            onChange={(e) => update(index, 'textVerticalAlign', e.target.value)}
                                                            className="w-full px-2 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="top">上</option>
                                                            <option value="center">中</option>
                                                            <option value="bottom">下</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-muted-foreground mb-1">水平對齊</label>
                                                        <select
                                                            value={img.textHorizontalAlign || 'center'}
                                                            onChange={(e) => update(index, 'textHorizontalAlign', e.target.value)}
                                                            className="w-full px-2 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                        >
                                                            <option value="left">左</option>
                                                            <option value="center">中</option>
                                                            <option value="right">右</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* 遮罩層 */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-muted-foreground">背景遮罩</label>

                                        {/* 遮罩顏色 */}
                                        <div>
                                            <label className="block text-xs text-muted-foreground mb-1">遮罩顏色</label>
                                            <div className="flex gap-1">
                                                <Input
                                                    type="color"
                                                    value={img.overlayColor || '#000000'}
                                                    onChange={(e) => update(index, 'overlayColor', e.target.value)}
                                                    className="w-10 h-9 p-1 cursor-pointer"
                                                />
                                                <Input
                                                    type="text"
                                                    value={img.overlayColor || '#000000'}
                                                    onChange={(e) => update(index, 'overlayColor', e.target.value)}
                                                    placeholder="#000000"
                                                    className="flex-1 text-xs"
                                                />
                                            </div>
                                        </div>

                                        {/* 遮罩透明度 - 拉桿樣式 */}
                                        <div className="space-y-2 bg-muted/50 p-3 rounded-lg border border-border">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-semibold text-muted-foreground">
                                                    遮罩透明度
                                                </Label>
                                                <span className="text-[10px] px-1.5 py-0.5 bg-background rounded border border-border text-muted-foreground min-w-[3rem] text-center">
                                                    {img.maskOpacity ?? 0}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                value={img.maskOpacity ?? 0}
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onTouchStart={(e) => e.stopPropagation()}
                                                onChange={(e) => update(index, 'maskOpacity', parseInt(e.target.value) || 0)}
                                                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
                <button
                    type="button"
                    onClick={() => add({ url: '', alt: '圖片', link: '' })}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增圖片
                </button>
            </div>

            {/* 背景顏色 */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">背景顏色</label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={props.backgroundColor || '#ffffff'}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                        className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                        type="text"
                        value={props.backgroundColor || ''}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                    />
                </div>
            </div>

            <SpacingControls
                paddingY={{
                    desktop: props.paddingYDesktop ?? 64,
                    mobile: props.paddingYMobile ?? 32
                }}
                onChange={onChange}
            />

            <ImageControls
                objectFit={{
                    desktop: props.objectFitDesktop || 'cover',
                    mobile: props.objectFitMobile || 'cover'
                }}
                onChange={onChange}
            />

            <AspectRatioControls
                aspectRatio={{
                    desktop: props.aspectRatioDesktop || 'auto',
                    mobile: props.aspectRatioMobile || 'auto'
                }}
                onChange={onChange}
            />

            <AnimationControls
                animation={props.animation}
                onChange={onChange}
            />
        </div>
    )
}
