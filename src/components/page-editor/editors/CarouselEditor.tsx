// 輪播圖編輯器
import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SpacingControls, ImageControls, AspectRatioControls } from '../responsive-controls'
import { AnimationControls } from '../animation-controls'
import { ImageInput } from '../image-input'
import { useListEditor } from '../shared/useListEditor'
import type { EditorProps } from '../shared/types'

export function CarouselEditor({ props, onChange }: EditorProps) {
    const { add, remove, update, items: images } = useListEditor(
        props.images || [],
        'images',
        onChange
    )

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={props.autoplay ?? true}
                            onChange={(e) => onChange({ autoplay: e.target.checked })}
                            className="bg-background border-input rounded"
                        />
                        自動輪播
                    </label>
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">間隔(秒)</label>
                    <Input
                        type="number"
                        min="1"
                        max="60"
                        value={props.interval || 5}
                        onChange={(e) => onChange({ interval: parseInt(e.target.value) || 5 })}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">圖片列表</label>
                {images.map((img: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <ImageInput
                            value={img.url || ''}
                            onChange={(url) => update(index, 'url', url)}
                            placeholder="圖片 URL"
                        />

                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input placeholder="圖片說明" value={img.alt || ''} onChange={(e) => update(index, 'alt', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => remove(index)} className="p-2 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <Input placeholder="連結 (可選)" value={img.link || ''} onChange={(e) => update(index, 'link', e.target.value)} />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => add({ url: '', alt: '圖片', link: '' })}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增圖片
                </button>
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">背景顏色</label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={props.backgroundColor || '#ffffff'}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                        className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                        type="text"
                        value={props.backgroundColor || ''}
                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                    />
                </div>
            </div>


            <SpacingControls
                paddingY={{
                    desktop: props.paddingYDesktop ?? 64,
                    mobile: props.paddingYMobile ?? 32
                }}
                onChange={onChange}
            />

            <ImageControls
                objectFit={{
                    desktop: props.objectFitDesktop || 'cover',
                    mobile: props.objectFitMobile || 'cover'
                }}
                onChange={onChange}
            />

            <AspectRatioControls
                aspectRatio={{
                    desktop: props.aspectRatioDesktop || 'auto',
                    mobile: props.aspectRatioMobile || 'auto'
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
