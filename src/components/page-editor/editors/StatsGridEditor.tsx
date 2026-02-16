import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import { Trash2, Plus } from 'lucide-react'
import type { EditorProps } from '../shared/types'

export function StatsGridEditor({ props, onChange }: EditorProps) {
    const stats = props.stats || []
    const logos = props.logos || []

    const updateStat = (index: number, field: string, value: string) => {
        const newStats = [...stats]
        newStats[index] = { ...newStats[index], [field]: value }
        onChange({ stats: newStats })
    }

    const addStat = () => {
        onChange({ stats: [...stats, { value: '0+', label: 'New Metric' }] })
    }

    const removeStat = (index: number) => {
        const newStats = [...stats]
        newStats.splice(index, 1)
        onChange({ stats: newStats })
    }

    const updateLogo = (index: number, url: string) => {
        const newLogos = [...logos]
        newLogos[index] = url
        onChange({ logos: newLogos })
    }

    const addLogo = () => {
        onChange({ logos: [...logos, ''] })
    }

    const removeLogo = (index: number) => {
        const newLogos = [...logos]
        newLogos.splice(index, 1)
        onChange({ logos: newLogos })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground/80">區塊設定</h4>
                <div className="space-y-2">
                    <label className="text-sm font-medium">標題</label>
                    <Input
                        value={props.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="Why Choose Us"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">描述內容</label>
                    <Textarea
                        value={props.description || ''}
                        onChange={(e) => onChange({ description: e.target.value })}
                        placeholder="Description..."
                        rows={3}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-foreground/80">數據指標</h4>
                    <Button variant="outline" size="sm" onClick={addStat}>
                        <Plus className="w-3 h-3 mr-1" /> 新增
                    </Button>
                </div>
                <div className="space-y-3">
                    {stats.map((stat: any, index: number) => (
                        <div key={index} className="flex gap-2 items-start border p-3 rounded-md bg-muted/40">
                            <div className="flex-1 space-y-2">
                                <Input
                                    value={stat.value}
                                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                                    placeholder="數值 (e.g. 25+)"
                                />
                                <Input
                                    value={stat.label}
                                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                                    placeholder="標籤 (e.g. Years)"
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStat(index)}
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-foreground/80">合作夥伴 Logo</h4>
                    <Button variant="outline" size="sm" onClick={addLogo}>
                        <Plus className="w-3 h-3 mr-1" /> 新增
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {logos.map((logo: string, index: number) => (
                        <div key={index} className="relative group p-2 border rounded-md">
                            <ImageInput
                                value={logo}
                                onChange={(url) => updateLogo(index, url)}
                            />
                            <div className="absolute -top-2 -right-2 hidden group-hover:block">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-6 w-6 rounded-full"
                                    onClick={() => removeLogo(index)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
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
