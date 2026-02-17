import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import { useListEditor } from '../shared/useListEditor'
import type { EditorProps } from '../shared/types'

export function ThreeDMarqueeEditor({ props, onChange }: EditorProps) {
    const images = props.images || [];

    const add = (url: string) => {
        onChange({ images: [...images, url] });
    };

    const remove = (index: number) => {
        onChange({ images: images.filter((_: string, i: number) => i !== index) });
    };

    const update = (index: number, url: string) => {
        const newImages = [...images];
        newImages[index] = url;
        onChange({ images: newImages });
    };

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">圖片列表 (建議至少 12 張以達到最佳效果)</label>
                {images.map((url: string, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-medium text-muted-foreground">圖片 {index + 1}</span>
                            <button type="button" onClick={() => remove(index)} className="p-1 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <ImageInput
                                value={url}
                                onChange={(newUrl) => update(index, newUrl)}
                                placeholder="圖片 URL"
                            />
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => add('https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80')}
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
                    desktop: props.paddingYDesktop ?? 0,
                    mobile: props.paddingYMobile ?? 0
                }}
                onChange={onChange}
            />
        </div>
    )
}
