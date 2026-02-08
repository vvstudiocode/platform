// 圖文組合編輯器
import { Input } from '@/components/ui/input'
import { SpacingControls, ImageControls, AspectRatioControls } from '../responsive-controls'
import { AnimationControls } from '../animation-controls'
import { ImageInput } from '../image-input'
import type { EditorProps } from '../shared/types'

export function ImageTextEditor({ props, onChange }: EditorProps) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">排版</label>
                <select
                    value={props.layout || 'left'}
                    onChange={(e) => onChange({ layout: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="left">圖片在左</option>
                    <option value="right">圖片在右</option>
                </select>
            </div>

            <div>
                <label className="block text-sm text-muted-foreground mb-1">圖片 URL</label>
                <ImageInput
                    value={props.imageUrl || ''}
                    onChange={(url) => onChange({ imageUrl: url })}
                    placeholder="https://..."
                />
            </div>

            <div>
                <label className="block text-sm text-muted-foreground mb-1">標題</label>
                <Input placeholder="標題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-1">內容</label>
                <textarea
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={4}
                    placeholder="文字說明..."
                    value={props.content || ''}
                    onChange={(e) => onChange({ content: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">按鈕文字</label>
                    <Input placeholder="了解更多" value={props.buttonText || ''} onChange={(e) => onChange({ buttonText: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">按鈕連結</label>
                    <Input placeholder="https://..." value={props.buttonUrl || ''} onChange={(e) => onChange({ buttonUrl: e.target.value })} />
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
