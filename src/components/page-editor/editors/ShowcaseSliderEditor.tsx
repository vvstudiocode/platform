// Showcase Slider 編輯器
import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import { useListEditor } from '../shared/useListEditor'
import type { EditorProps } from '../shared/types'

export function ShowcaseSliderEditor({ props, onChange }: EditorProps) {
    const { add, remove, update, items: slides } = useListEditor(
        props.slides || [],
        'slides',
        onChange
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={props.autoplay ?? true}
                    onChange={(e) => onChange({ autoplay: e.target.checked })}
                    className="bg-background border-input rounded"
                />
                <label className="text-sm text-muted-foreground">自動輪播</label>
            </div>

            <div className="space-y-4">
                {slides.map((slide: any, index: number) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3 border border-border">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Slide {index + 1}</span>
                            <button onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <ImageInput
                            value={slide.image || ''}
                            onChange={(url) => update(index, 'image', url)}
                            placeholder="圖片 URL"
                        />

                        <Input
                            placeholder="標題"
                            value={slide.title || ''}
                            onChange={(e) => update(index, 'title', e.target.value)}
                        />
                        <Input
                            placeholder="副標題"
                            value={slide.subtitle || ''}
                            onChange={(e) => update(index, 'subtitle', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                placeholder="按鈕文字"
                                value={slide.buttonText || ''}
                                onChange={(e) => update(index, 'buttonText', e.target.value)}
                            />
                            <Input
                                placeholder="連結"
                                value={slide.link || ''}
                                onChange={(e) => update(index, 'link', e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={() => add({
                    image: '',
                    title: 'New Slide',
                    subtitle: 'Subtitle',
                    buttonText: 'View More',
                    link: ''
                })}
                className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
            >
                + 新增投影片
            </button>

            <div className="space-y-2 pt-2">
                <label className="block text-sm text-muted-foreground mb-1">按鈕 Hover 顏色</label>
                <div className="flex gap-2 items-center">
                    <input
                        type="color"
                        value={props.buttonHoverColor || '#e11d48'}
                        onChange={(e) => onChange({ buttonHoverColor: e.target.value })}
                        className="h-9 w-16 p-1 rounded cursor-pointer bg-background border border-input"
                    />
                    <span className="text-sm text-muted-foreground uppercase">{props.buttonHoverColor || '#e11d48'}</span>
                </div>
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
