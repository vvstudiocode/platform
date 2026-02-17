// 3D 輪播編輯器
import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import { useListEditor } from '../shared/useListEditor'
import type { EditorProps } from '../shared/types'

export function Carousel3DEditor({ props, onChange }: EditorProps) {
    const { add, remove, update, items: images } = useListEditor(
        props.images || [],
        'images',
        onChange
    )

    return (
        <div className="space-y-4">
            {/* 基本設定 */}
            <div className="space-y-3 bg-muted/50 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">自動旋轉</Label>
                    <Switch
                        checked={props.autoRotate ?? true}
                        onCheckedChange={(checked) => onChange({ autoRotate: checked })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">旋轉速度 (秒)</Label>
                        <Input
                            placeholder="32s"
                            value={props.rotationDuration || '32s'}
                            onChange={(e) => onChange({ rotationDuration: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">卡片寬度</Label>
                        <Input
                            placeholder="17.5em"
                            value={props.cardWidth || '17.5em'}
                            onChange={(e) => onChange({ cardWidth: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">透視距離 (Perspective)</Label>
                        <Input
                            placeholder="35em"
                            value={props.perspective || '35em'}
                            onChange={(e) => onChange({ perspective: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">卡片間距</Label>
                        <Input
                            placeholder="0.5em"
                            value={props.gap || '0.5em'}
                            onChange={(e) => onChange({ gap: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* 圖片列表 */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold">圖片列表 ({images.length})</Label>
                <div className="space-y-3">
                    {images.map((img: any, index: number) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
                            <div className="flex gap-2 items-start">
                                <div className="flex-1 space-y-2">
                                    <ImageInput
                                        value={img.url || ''}
                                        onChange={(url) => update(index, 'url', url)}
                                        placeholder="圖片 URL"
                                    />
                                    <Input
                                        placeholder="圖片說明"
                                        value={img.alt || ''}
                                        onChange={(e) => update(index, 'alt', e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => add({ url: '', alt: '' })}
                        className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors text-sm"
                    >
                        + 新增圖片
                    </button>
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
