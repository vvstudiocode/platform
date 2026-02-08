// 文字欄位編輯器
import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SpacingControls } from '../responsive-controls'
import { AnimationControls } from '../animation-controls'
import { useListEditor } from '../shared/useListEditor'
import type { EditorProps } from '../shared/types'

export function TextColumnsEditor({ props, onChange }: EditorProps) {
    const { add, remove, update, items: columns } = useListEditor(
        props.columns || [],
        'columns',
        onChange
    )

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">欄數</label>
                <select
                    value={props.columnCount || 3}
                    onChange={(e) => onChange({ columnCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="2">2 欄</option>
                    <option value="3">3 欄</option>
                    <option value="4">4 欄</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">欄位內容</label>
                {columns.map((col: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex gap-2">
                            <Input placeholder="欄位標題" value={col.title || ''} onChange={(e) => update(index, 'title', e.target.value)} />
                            <button type="button" onClick={() => remove(index)} className="p-1 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <textarea
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            rows={2}
                            placeholder="欄位內容"
                            value={col.content || ''}
                            onChange={(e) => update(index, 'content', e.target.value)}
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => add({ title: '欄位', content: '內容' })}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增欄位
                </button>
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
