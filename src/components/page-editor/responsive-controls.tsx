import { useState } from 'react'
import { Monitor, Smartphone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ResponsiveValue<T> {
    desktop: T
    mobile: T
}

interface ResponsiveControlsProps {
    layout: ResponsiveValue<'grid' | 'list'>
    columns: ResponsiveValue<number>
    onChange: (updates: {
        layoutDesktop?: 'grid' | 'list'
        layoutMobile?: 'grid' | 'list'
        columnsDesktop?: number
        columnsMobile?: number
    }) => void
}


function DeviceToggles({ mode, setMode }: { mode: 'desktop' | 'mobile', setMode: (m: 'desktop' | 'mobile') => void }) {
    const isDesktop = mode === 'desktop'
    return (
        <div className="flex bg-background rounded-lg p-0.5 border border-border">
            <button
                type="button"
                onClick={() => setMode('desktop')}
                className={`p-1.5 rounded transition-colors ${isDesktop ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="桌面版"
            >
                <Monitor className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => setMode('mobile')}
                className={`p-1.5 rounded transition-colors ${!isDesktop ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="手機版"
            >
                <Smartphone className="h-4 w-4" />
            </button>
        </div>
    )
}

export function ResponsiveControls({ layout, columns, onChange }: ResponsiveControlsProps) {
    const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')
    const isDesktop = mode === 'desktop'

    return (
        <div className="space-y-4 bg-muted/50 p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
                <span className="text-xs font-semibold text-muted-foreground">響應式排版</span>
                <DeviceToggles mode={mode} setMode={setMode} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                        {isDesktop ? '桌面' : '手機'}佈局
                    </Label>
                    <select
                        value={isDesktop ? layout.desktop : layout.mobile}
                        onChange={(e) => {
                            const val = e.target.value as 'grid' | 'list'
                            onChange(isDesktop ? { layoutDesktop: val } : { layoutMobile: val })
                        }}
                        className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm text-foreground focus:outline-none focus:border-ring"
                    >
                        <option value="grid">網格 Grid</option>
                        <option value="list">列表 List</option>
                    </select>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                        {isDesktop ? '桌面' : '手機'}欄數
                    </Label>
                    <Input
                        type="number"
                        min="1"
                        max={isDesktop ? 6 : 2}
                        value={isDesktop ? columns.desktop : columns.mobile}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 1
                            onChange(isDesktop ? { columnsDesktop: val } : { columnsMobile: val })
                        }}
                        className="h-8 bg-background border-input text-foreground"
                    />
                </div>
            </div>

            <div className="text-[10px] text-muted-foreground text-right">
                {isDesktop ? '預設: 網格 / 3欄' : '預設: 網格 / 1欄'}
            </div>
        </div>
    )
}

export function SpacingControls({ paddingY, onChange }: {
    paddingY: { desktop: number; mobile: number },
    onChange: (updates: { paddingYDesktop?: number; paddingYMobile?: number }) => void
}) {
    const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')
    const isDesktop = mode === 'desktop'
    const value = isDesktop ? (paddingY?.desktop ?? 64) : (paddingY?.mobile ?? 32)

    return (
        <div className="space-y-2 bg-muted/50 p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                        垂直間距
                    </Label>
                    <span className="text-[10px] px-1.5 py-0.5 bg-background rounded border border-border text-muted-foreground min-w-[3rem] text-center">
                        {value}px
                    </span>
                </div>
                <DeviceToggles mode={mode} setMode={setMode} />
            </div>

            <input
                type="range"
                min="0"
                max="200"
                step="4"
                value={value}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onChange={(e) => {
                    const val = parseInt(e.target.value)
                    onChange(isDesktop ? { paddingYDesktop: val } : { paddingYMobile: val })
                }}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
            />
        </div>
    )
}

export function ImageControls({ objectFit, onChange }: {
    objectFit: { desktop: 'cover' | 'contain'; mobile: 'cover' | 'contain' },
    onChange: (updates: { objectFitDesktop?: 'cover' | 'contain'; objectFitMobile?: 'cover' | 'contain' }) => void
}) {
    const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')
    const isDesktop = mode === 'desktop'

    return (
        <div className="space-y-3 bg-muted/50 p-3 rounded-lg border border-border mt-3">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground">
                    圖片填滿方式
                </Label>
                <DeviceToggles mode={mode} setMode={setMode} />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => onChange(isDesktop ? { objectFitDesktop: 'cover' } : { objectFitMobile: 'cover' })}
                    className={`px-3 py-2 text-xs rounded border transition-colors ${(isDesktop ? objectFit.desktop : objectFit.mobile) === 'cover'
                        ? 'bg-accent border-primary text-primary'
                        : 'border-border text-muted-foreground hover:border-input'
                        }`}
                >
                    放大填滿 (Cover)
                </button>
                <button
                    type="button"
                    onClick={() => onChange(isDesktop ? { objectFitDesktop: 'contain' } : { objectFitMobile: 'contain' })}
                    className={`px-3 py-2 text-xs rounded border transition-colors ${(isDesktop ? objectFit.desktop : objectFit.mobile) === 'contain'
                        ? 'bg-accent border-primary text-primary'
                        : 'border-border text-muted-foreground hover:border-input'
                        }`}
                >
                    完整顯示 (Contain)
                </button>
            </div>
        </div>
    )
}

export function AspectRatioControls({ aspectRatio, onChange }: {
    aspectRatio: { desktop: string; mobile: string },
    onChange: (updates: { aspectRatioDesktop?: string; aspectRatioMobile?: string }) => void
}) {
    const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')
    const isDesktop = mode === 'desktop'

    return (
        <div className="space-y-3 bg-muted/50 p-3 rounded-lg border border-border mt-3">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground">
                    圖片比例
                </Label>
                <DeviceToggles mode={mode} setMode={setMode} />
            </div>

            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: '1:1', value: '1/1' },
                    { label: '3:4', value: '3/4' },
                    { label: '2:1', value: '2/1' }
                ].map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(isDesktop ? { aspectRatioDesktop: opt.value } : { aspectRatioMobile: opt.value })}
                        className={`px-2 py-2 text-xs rounded border transition-colors ${(isDesktop ? aspectRatio.desktop : aspectRatio.mobile) === opt.value
                            ? 'bg-accent border-primary text-primary'
                            : 'border-border text-muted-foreground hover:border-input'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
