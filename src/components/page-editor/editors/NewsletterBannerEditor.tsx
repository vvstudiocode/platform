import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import type { EditorProps } from '../shared/types'

export function NewsletterBannerEditor({ props, onChange }: EditorProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">背景圖片</label>
                <ImageInput
                    value={props.backgroundImage || ''}
                    onChange={(url) => onChange({ backgroundImage: url })}
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <label className="text-sm font-medium">遮罩透明度</label>
                    <span className="text-xs text-muted-foreground">{Math.round((props.overlayOpacity ?? 0.5) * 100)}%</span>
                </div>
                <Slider
                    value={[props.overlayOpacity ?? 0.5]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={([value]) => onChange({ overlayOpacity: value })}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">標題</label>
                <Textarea
                    value={props.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="標題 (支援換行)"
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">輸入框提示文字</label>
                <Input
                    value={props.placeholder || ''}
                    onChange={(e) => onChange({ placeholder: e.target.value })}
                    placeholder="Email address"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">按鈕文字</label>
                <Input
                    value={props.buttonText || ''}
                    onChange={(e) => onChange({ buttonText: e.target.value })}
                    placeholder="Subscribe"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">按鈕連結 (選填)</label>
                <Input
                    value={props.buttonUrl || ''}
                    onChange={(e) => onChange({ buttonUrl: e.target.value })}
                    placeholder="https://..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">底部小字</label>
                <Textarea
                    value={props.subtitle || ''}
                    onChange={(e) => onChange({ subtitle: e.target.value })}
                    placeholder="私隱權聲明等..."
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">背景顏色</label>
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
                    desktop: props.paddingYDesktop ?? 80,
                    mobile: props.paddingYMobile ?? 64
                }}
                onChange={onChange}
            />
        </div>
    )
}
