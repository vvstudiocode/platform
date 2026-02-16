import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EditorProps } from '../shared/types'
import { SpacingControls } from '../responsive-controls'
import { AnimationControls } from '../animation-controls'
import { ImageInput } from '../image-input'

export function BeforeAfterEditor({ props, onChange }: EditorProps) {
    const handleChange = (key: string, value: any) => {
        onChange({ [key]: value })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Before Image (Left/Bottom)</Label>
                <ImageInput
                    value={props.beforeImage || ''}
                    onChange={(url) => handleChange('beforeImage', url)}
                    placeholder="https://..."
                />
            </div>

            <div className="space-y-2">
                <Label>Before Label</Label>
                <Input
                    value={props.beforeLabel || ''}
                    onChange={(e) => handleChange('beforeLabel', e.target.value)}
                    placeholder="e.g. Before"
                />
            </div>

            <div className="space-y-2">
                <Label>After Image (Right/Top)</Label>
                <ImageInput
                    value={props.afterImage || ''}
                    onChange={(url) => handleChange('afterImage', url)}
                    placeholder="https://..."
                />
            </div>

            <div className="space-y-2">
                <Label>After Label</Label>
                <Input
                    value={props.afterLabel || ''}
                    onChange={(e) => handleChange('afterLabel', e.target.value)}
                    placeholder="e.g. After"
                />
            </div>

            <div className="space-y-2">
                <Label>Slider Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={props.sliderColor || '#ffffff'}
                        onChange={(e) => handleChange('sliderColor', e.target.value)}
                        className="w-12 h-10 p-1"
                    />
                    <Input
                        value={props.sliderColor || '#ffffff'}
                        onChange={(e) => handleChange('sliderColor', e.target.value)}
                        placeholder="#ffffff"
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

            <AnimationControls
                animation={props.animation}
                onChange={onChange}
            />
        </div>
    )
}
