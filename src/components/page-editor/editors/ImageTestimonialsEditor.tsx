// 圖片見證牆編輯器
import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import { useListEditor } from '../shared/useListEditor'
import type { EditorProps } from '../shared/types'

export function ImageTestimonialsEditor({ props, onChange }: EditorProps) {
    const { add, remove, update, items: testimonials } = useListEditor(
        props.testimonials || [],
        'testimonials',
        onChange
    )

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={props.autoplay ?? false}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ autoplay: e.target.checked })}
                            className="bg-background border-input rounded"
                        />
                        自動輪播
                    </label>
                </div>
                {props.autoplay && (
                    <div className="col-span-2">
                        <label className="text-xs text-muted-foreground block mb-1">輪播間隔 (秒)</label>
                        <Input
                            type="number"
                            min={1}
                            value={(props.autoplayDuration || 5000) / 1000}
                            onChange={(e) => onChange({ autoplayDuration: parseInt(e.target.value) * 1000 })}
                            className="h-8"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">見證項目列表</label>
                {testimonials.map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-muted-foreground">項目 {index + 1}</span>
                            <button type="button" onClick={() => remove(index)} className="p-1 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">照片</label>
                            <ImageInput
                                value={item.src || ''}
                                onChange={(url) => update(index, 'src', url)}
                                placeholder="圖片 URL"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">姓名</label>
                                <Input
                                    placeholder="姓名"
                                    value={item.name || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(index, 'name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">職稱</label>
                                <Input
                                    placeholder="職稱"
                                    value={item.designation || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(index, 'designation', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">證言內容</label>
                            <Textarea
                                placeholder="請輸入證言內容..."
                                value={item.quote || ''}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update(index, 'quote', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => add({
                        id: crypto.randomUUID(),
                        quote: '這是一個非常棒的產品，完全改變了我們的工作方式。',
                        name: '使用者姓名',
                        designation: '職稱',
                        src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop'
                    })}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增見證項目
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
