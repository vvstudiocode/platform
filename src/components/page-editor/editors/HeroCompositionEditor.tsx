import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import type { EditorProps } from '../shared/types'

export function HeroCompositionEditor({ props, onChange }: EditorProps) {
    const images = props.images || []

    const updateImage = (index: number, url: string) => {
        const newImages = [...images]
        newImages[index] = url
        onChange({ images: newImages })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">標題</label>
                <Textarea
                    value={props.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="輸入標題 (支援換行)"
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">描述內容</label>
                <Textarea
                    value={props.description || ''}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="輸入描述"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">按鈕文字</label>
                    <Input
                        value={props.buttonText || ''}
                        onChange={(e) => onChange({ buttonText: e.target.value })}
                        placeholder="Plan your trip"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">按鈕連結</label>
                    <Input
                        value={props.buttonUrl || ''}
                        onChange={(e) => onChange({ buttonUrl: e.target.value })}
                        placeholder="https://..."
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">圖片設定 (需 3 張)</h4>

                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">主圖 (左側大圖)</label>
                    <ImageInput
                        value={images[0] || ''}
                        onChange={(url) => updateImage(0, url)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">副圖 1 (右上)</label>
                    <ImageInput
                        value={images[1] || ''}
                        onChange={(url) => updateImage(1, url)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">副圖 2 (右下)</label>
                    <ImageInput
                        value={images[2] || ''}
                        onChange={(url) => updateImage(2, url)}
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
        </div>
    )
}
