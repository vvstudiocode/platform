import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import { useListEditor } from '../shared/useListEditor'
import type { EditorProps } from '../shared/types'

export function AppleCardsCarouselEditor({ props, onChange }: EditorProps) {
    const { add, remove, update, items } = useListEditor(
        props.items || [],
        'items',
        onChange
    )

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">卡片列表</label>
                {items.map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-muted-foreground">卡片 {index + 1}</span>
                            <button type="button" onClick={() => remove(index)} className="p-1 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">圖片</label>
                            <ImageInput
                                value={item.src || ''}
                                onChange={(url) => update(index, 'src', url)}
                                placeholder="圖片 URL"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">分類</label>
                                <Input
                                    placeholder="例如: 科技"
                                    value={item.category || ''}
                                    onChange={(e) => update(index, 'category', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">標題</label>
                                <Input
                                    placeholder="標題..."
                                    value={item.title || ''}
                                    onChange={(e) => update(index, 'title', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => add({
                        src: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        category: 'New Category',
                        title: 'New Title',
                    })}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增卡片
                </button>
            </div>

            <SpacingControls
                paddingY={{
                    desktop: props.paddingYDesktop ?? 0,
                    mobile: props.paddingYMobile ?? 0
                }}
                onChange={onChange}
            />
        </div>
    )
}
