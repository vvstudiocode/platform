// 純文字編輯器
import { Input } from '@/components/ui/input'
import { SpacingControls } from '../responsive-controls'
import { AnimationControls } from '../animation-controls'
import type { EditorProps } from '../shared/types'

// Helper for alignment buttons
function AlignmentButtons({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    return (
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
            {[
                { value: 'left', label: '左' },
                { value: 'center', label: '中' },
                { value: 'right', label: '右' },
            ].map((align) => (
                <button
                    key={align.value}
                    type="button"
                    onClick={() => onChange(align.value)}
                    className={`flex-1 py-1.5 text-xs rounded transition-colors ${(value || 'center') === align.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    {align.label}
                </button>
            ))}
        </div>
    )
}

export function TextEditor({ props, onChange }: EditorProps) {
    return (
        <div className="space-y-4">
            {/* 標題與副標題 */}
            <div className="space-y-3">
                <Input
                    placeholder="大標題"
                    value={props.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                    className="font-bold"
                />
                <Input
                    placeholder="副標題"
                    value={props.subtitle || ''}
                    onChange={(e) => onChange({ subtitle: e.target.value })}
                />
            </div>

            {/* 內容 */}
            <div>
                <label className="block text-sm text-muted-foreground mb-1">內容</label>
                <textarea
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={6}
                    placeholder="輸入文字內容..."
                    value={props.content || ''}
                    onChange={(e) => onChange({ content: e.target.value })}
                />
            </div>

            {/* 樣式設定 (排版與顏色) */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">對齊方式</label>
                    <AlignmentButtons value={props.align || 'center'} onChange={(val) => onChange({ align: val })} />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">文字顏色</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={props.textColor || '#000000'}
                            onChange={(e) => onChange({ textColor: e.target.value })}
                            className="h-7 w-7 rounded cursor-pointer bg-transparent border-none p-0"
                        />
                        <span className="text-xs text-muted-foreground uppercase">{props.textColor || '#000'}</span>
                    </div>
                </div>
            </div>

            {/* 按鈕設定 */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">顯示按鈕</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={props.showButton || false}
                            onChange={(e) => onChange({ showButton: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {props.showButton && (
                    <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                        <Input
                            placeholder="按鈕文字"
                            value={props.buttonText || ''}
                            onChange={(e) => onChange({ buttonText: e.target.value })}
                        />
                        <Input
                            placeholder="連結 URL"
                            value={props.buttonUrl || ''}
                            onChange={(e) => onChange({ buttonUrl: e.target.value })}
                        />
                    </div>
                )}
            </div>

            <SpacingControls
                paddingY={{
                    desktop: props.paddingYDesktop ?? 64,
                    mobile: props.paddingYMobile ?? 32
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
