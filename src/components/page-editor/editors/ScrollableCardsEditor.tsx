import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import { Trash2, Plus } from 'lucide-react'
import type { EditorProps } from '../shared/types'

export function ScrollableCardsEditor({ props, onChange }: EditorProps) {
    const services = props.services || []

    const updateService = (index: number, field: string, value: string) => {
        const newServices = [...services]
        newServices[index] = { ...newServices[index], [field]: value }
        onChange({ services: newServices })
    }

    const addService = () => {
        const id = (services.length + 1).toString().padStart(2, '0')
        onChange({
            services: [
                ...services,
                {
                    id,
                    title: 'New Service',
                    description: 'Description here...',
                    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'
                }
            ]
        })
    }

    const removeService = (index: number) => {
        const newServices = [...services]
        newServices.splice(index, 1)
        onChange({ services: newServices })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium">區塊標題</label>
                <Input
                    value={props.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Services we provide"
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-foreground/80">服務項目</h4>
                    <Button variant="outline" size="sm" onClick={addService}>
                        <Plus className="w-3 h-3 mr-1" /> 新增
                    </Button>
                </div>
                <div className="space-y-6">
                    {services.map((service: any, index: number) => (
                        <div key={index} className="space-y-3 p-4 border rounded-lg bg-muted/20">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">ID: {service.id}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeService(index)}
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">圖片</label>
                                <ImageInput
                                    value={service.image}
                                    onChange={(url) => updateService(index, 'image', url)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">標題</label>
                                <Input
                                    value={service.title}
                                    onChange={(e) => updateService(index, 'title', e.target.value)}
                                    placeholder="標題"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">描述</label>
                                <Textarea
                                    value={service.description}
                                    onChange={(e) => updateService(index, 'description', e.target.value)}
                                    placeholder="描述..."
                                    rows={2}
                                />
                            </div>
                        </div>
                    ))}
                </div>
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
        </div>
    )
}
