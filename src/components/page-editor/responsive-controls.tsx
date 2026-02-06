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

export function ResponsiveControls({ layout, columns, onChange }: ResponsiveControlsProps) {
    const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')

    const isDesktop = mode === 'desktop'

    return (
        <div className="space-y-4 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-700 mb-2">
                <span className="text-xs font-semibold text-zinc-400">響應式排版</span>
                <div className="flex bg-zinc-900 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setMode('desktop')}
                        className={`p-1.5 rounded transition-colors ${isDesktop ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="桌面版"
                    >
                        <Monitor className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('mobile')}
                        className={`p-1.5 rounded transition-colors ${!isDesktop ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="手機版"
                    >
                        <Smartphone className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs text-zinc-400 mb-1.5 block">
                        {isDesktop ? '桌面' : '手機'}佈局
                    </Label>
                    <select
                        value={isDesktop ? layout.desktop : layout.mobile}
                        onChange={(e) => {
                            const val = e.target.value as 'grid' | 'list'
                            onChange(isDesktop ? { layoutDesktop: val } : { layoutMobile: val })
                        }}
                        className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-600 rounded text-sm text-white focus:outline-none focus:border-zinc-500"
                    >
                        <option value="grid">網格 Grid</option>
                        <option value="list">列表 List</option>
                    </select>
                </div>
                <div>
                    <Label className="text-xs text-zinc-400 mb-1.5 block">
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
                        className="h-8 bg-zinc-900 border-zinc-600"
                    />
                </div>
            </div>

            <div className="text-[10px] text-zinc-500 text-right">
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
        <div className="space-y-4 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-700 mb-2">
                <span className="text-xs font-semibold text-zinc-400">上下間距設定</span>
                <div className="flex bg-zinc-900 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setMode('desktop')}
                        className={`p-1.5 rounded transition-colors ${isDesktop ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="桌面版"
                    >
                        <Monitor className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('mobile')}
                        className={`p-1.5 rounded transition-colors ${!isDesktop ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="手機版"
                    >
                        <Smartphone className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs text-zinc-400">
                        {isDesktop ? '桌面' : '手機'}垂直間距 (px)
                    </Label>
                    <span className="text-xs text-zinc-500">{value}px</span>
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
                    className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
            </div>
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
        <div className="space-y-3 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 mt-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-700 mb-2">
                <span className="text-xs font-semibold text-zinc-400">圖片顯示設定</span>
                <div className="flex bg-zinc-900 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setMode('desktop')}
                        className={`p-1.5 rounded transition-colors ${isDesktop ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="桌面版"
                    >
                        <Monitor className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('mobile')}
                        className={`p-1.5 rounded transition-colors ${!isDesktop ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="手機版"
                    >
                        <Smartphone className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">
                    {isDesktop ? '桌面' : '手機'}圖片填滿方式
                </Label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => onChange(isDesktop ? { objectFitDesktop: 'cover' } : { objectFitMobile: 'cover' })}
                        className={`px-3 py-2 text-xs rounded border transition-colors ${(isDesktop ? objectFit.desktop : objectFit.mobile) === 'cover'
                            ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                            }`}
                    >
                        裁切填滿 (Cover)
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange(isDesktop ? { objectFitDesktop: 'contain' } : { objectFitMobile: 'contain' })}
                        className={`px-3 py-2 text-xs rounded border transition-colors ${(isDesktop ? objectFit.desktop : objectFit.mobile) === 'contain'
                            ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                            }`}
                    >
                        完整顯示 (Contain)
                    </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5">
                    {(isDesktop ? objectFit.desktop : objectFit.mobile) === 'cover'
                        ? '圖片會被裁切以填滿區域'
                        : '圖片會完整顯示，但可能會留白'}
                </p>
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
        <div className="space-y-3 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 mt-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-700 mb-2">
                <span className="text-xs font-semibold text-zinc-400">圖片比例設定</span>
                <div className="flex bg-zinc-900 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setMode('desktop')}
                        className={`p-1.5 rounded transition-colors ${isDesktop ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="桌面版"
                    >
                        <Monitor className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('mobile')}
                        className={`p-1.5 rounded transition-colors ${!isDesktop ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title="手機版"
                    >
                        <Smartphone className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">
                    {isDesktop ? '桌面' : '手機'}圖片比例
                </Label>
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
                                ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                                : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
