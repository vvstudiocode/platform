// Hero Banner 編輯器
import { Input } from '@/components/ui/input'
import { SpacingControls } from '../responsive-controls'
import { AnimationControls } from '../animation-controls'
import { ImageInput } from '../image-input'
import type { EditorProps } from '../shared/types'

export function HeroEditor({ props, onChange }: EditorProps) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">標題</label>
                <Input placeholder="標題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-1">副標題</label>
                <Input placeholder="副標題" value={props.subtitle || ''} onChange={(e) => onChange({ subtitle: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-1">背景圖片網址</label>
                <ImageInput
                    value={props.backgroundUrl || ''}
                    onChange={(url) => onChange({ backgroundUrl: url })}
                    placeholder="https://..."
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

            <AnimationControls
                animation={props.animation}
                onChange={onChange}
            />
        </div>
    )
}
