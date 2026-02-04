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
                <span className="text-xs font-semibold text-zinc-400">響應式設定</span>
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
