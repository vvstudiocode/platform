// FAQ 編輯器
import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useListEditor } from '../shared/useListEditor'
import type { EditorProps } from '../shared/types'
import { SpacingControls } from '../responsive-controls'

export function FAQEditor({ props, onChange }: EditorProps) {
    const {
        title = '常見問題',
        items = [],
        paddingYDesktop = 64,
        paddingYMobile = 32
    } = props || {}

    const { add, remove, update, items: listItems } = useListEditor(
        items,
        'items',
        onChange
    )

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">區塊標題</label>
                <Input placeholder="常見問題" value={title} onChange={(e) => onChange({ ...props, title: e.target.value })} />
            </div>

            <SpacingControls
                paddingY={{ desktop: paddingYDesktop, mobile: paddingYMobile }}
                onChange={(updates) => {
                    onChange({ ...props, ...updates })
                }}
            />

            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">問答項目</label>
                {items.map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input placeholder="問題" value={item.question || ''} onChange={(e) => update(index, 'question', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => remove(index)} className="p-1 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <textarea
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            rows={2}
                            placeholder="答案"
                            value={item.answer || ''}
                            onChange={(e) => update(index, 'answer', e.target.value)}
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => add({ question: '新問題？', answer: '請輸入答案' })}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增問答
                </button>
            </div>
        </div>
    )
}
