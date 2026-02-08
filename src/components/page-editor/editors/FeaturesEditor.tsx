// 特色區塊編輯器
import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SpacingControls } from '../responsive-controls'
import { AnimationControls } from '../animation-controls'
import { useListEditor } from '../shared/useListEditor'
import { AlignmentButtons } from '../shared/AlignmentButtons'
import type { EditorProps } from '../shared/types'

export function FeaturesEditor({ props, onChange }: EditorProps) {
    const { add, remove, update, items } = useListEditor(
        props.items || [],
        'items',
        onChange
    )

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">區塊標題</label>
                <div className="space-y-2">
                    <Input placeholder="標題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
                    <AlignmentButtons value={props.titleAlign || 'center'} onChange={(val) => onChange({ titleAlign: val })} />
                </div>
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">特色項目</label>
                {items.map((item: any, index: number) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="圖標 (emoji)" value={item.icon || ''} onChange={(e) => update(index, 'icon', e.target.value)} />
                                <Input placeholder="標題" value={item.title || ''} onChange={(e) => update(index, 'title', e.target.value)} />
                            </div>
                            <Input placeholder="說明" value={item.description || ''} onChange={(e) => update(index, 'description', e.target.value)} />
                        </div>
                        <button type="button" onClick={() => remove(index)} className="p-1 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => add({ icon: '✨', title: '特色', description: '特色說明' })}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增特色
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
