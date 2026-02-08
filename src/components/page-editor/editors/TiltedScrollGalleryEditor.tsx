// 傾斜滾動圖庫編輯器
import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import { useListEditor } from '../shared/useListEditor'
import type { EditorProps } from '../shared/types'

export function TiltedScrollGalleryEditor({ props, onChange }: EditorProps) {
    const { add, remove, update, items: images } = useListEditor(
        props.images || [],
        'images',
        onChange
    )

    return (
        <div className="space-y-4">
            {/* 內容設定 */}
            <div className="space-y-4 border-b pb-4">
                <h3 className="font-medium">內容設定</h3>
                <div className="space-y-2">
                    <label className="block text-sm text-muted-foreground">標題</label>
                    <Input
                        value={props.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="例如: Discover NFT Collections"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm text-muted-foreground">副標題</label>
                    <Input
                        value={props.subtitle || ''}
                        onChange={(e) => onChange({ subtitle: e.target.value })}
                        placeholder="例如: Explore the top collections from the best..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <label className="block text-sm text-muted-foreground">按鈕文字</label>
                        <Input
                            value={props.buttonText || ''}
                            onChange={(e) => onChange({ buttonText: e.target.value })}
                            placeholder="例如: Start experience"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm text-muted-foreground">按鈕連結</label>
                        <Input
                            value={props.buttonLink || ''}
                            onChange={(e) => onChange({ buttonLink: e.target.value })}
                            placeholder="/collections"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm text-muted-foreground">按鈕 Hover 顏色</label>
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
            </div>

            {/* 圖片列表 */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">圖片列表</label>
                {images.map((img: any, index: number) => (
                    <div key={index} className="flex gap-2 items-start bg-muted/30 p-2 rounded-lg">
                        <div className="flex-1 space-y-1">
                            <ImageInput
                                value={img.url}
                                onChange={(value) => update(index, 'url', value)}
                                placeholder="圖片網址"
                            />
                            <Input
                                placeholder="替代文字 (選填)"
                                value={img.alt || ''}
                                onChange={(e) => update(index, 'alt', e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1.5 text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => add({ url: '', alt: '' })}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增圖片
                </button>
            </div>

            {/* 欄數設定 */}
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">
                    欄數 (Columns)
                </label>
                <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => onChange({ columns: num })}
                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${(props.columns || 3) === num
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted/50 text-muted-foreground border-input hover:bg-muted'
                                }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>

            {/* 傾斜角度 X */}
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">
                    X 軸傾斜角度 ({props.rotateX ?? 20}度)
                </label>
                <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={props.rotateX ?? 20}
                    onChange={(e) => onChange({ rotateX: parseInt(e.target.value) })}
                    className="w-full"
                />
            </div>

            {/* 傾斜角度 Z */}
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">
                    Z 軸傾斜角度 ({props.rotateZ ?? -10}度)
                </label>
                <input
                    type="range"
                    min="-20"
                    max="20"
                    step="1"
                    value={props.rotateZ ?? -10}
                    onChange={(e) => onChange({ rotateZ: parseInt(e.target.value) })}
                    className="w-full"
                />
            </div>

            {/* 縮放比例 */}
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">
                    縮放比例 ({props.scale ?? 1.5})
                </label>
                <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={props.scale ?? 1.5}
                    onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
                    className="w-full"
                />
            </div>

            {/* 速度 */}
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">
                    滾動速度 ({props.speed ?? 15})
                </label>
                <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={props.speed ?? 15}
                    onChange={(e) => onChange({ speed: parseInt(e.target.value) })}
                    className="w-full"
                />
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
