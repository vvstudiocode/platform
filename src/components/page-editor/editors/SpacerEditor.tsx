import { useState } from 'react'
import { Label } from '@/components/ui/label'
import type { EditorProps } from '../shared/types'
import { Monitor, Smartphone } from 'lucide-react'

// 本地的裝置切換元件
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

export function SpacerEditor({ props, onChange }: EditorProps) {
    const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')
    const isDesktop = mode === 'desktop'

    const heightDesktop = props.heightDesktop ?? 50
    const heightMobile = props.heightMobile ?? 30
    const backgroundColor = props.backgroundColor || 'transparent'

    const value = isDesktop ? heightDesktop : heightMobile

    return (
        <div className="space-y-4">
            {/* 高度控制 */}
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
                    step="5"
                    value={value}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        const val = parseInt(e.target.value)
                        onChange(isDesktop ? { heightDesktop: val } : { heightMobile: val })
                    }}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary block"
                />
            </div>

            {/* 背景顏色 */}
            <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">背景顏色</Label>
                <input
                    type="color"
                    value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                    onChange={(e) => onChange({ backgroundColor: e.target.value })}
                    className="w-full h-10 rounded border border-border cursor-pointer"
                />
                <button
                    type="button"
                    onClick={() => onChange({ backgroundColor: 'transparent' })}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                    設為透明
                </button>
            </div>
        </div>
    )
}
