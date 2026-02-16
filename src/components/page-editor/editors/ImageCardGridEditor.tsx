import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import type { EditorProps } from '../shared/types'

export function ImageCardGridEditor({ props, onChange }: EditorProps) {
    const cards = props.cards || []

    const addCard = () => {
        onChange({
            cards: [
                ...cards,
                {
                    title: 'New Destination',
                    subtitle: 'Country/Location',
                    imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80',
                    link: '#'
                }
            ]
        })
    }

    const updateCard = (index: number, field: string, value: any) => {
        const newCards = [...cards]
        newCards[index] = { ...newCards[index], [field]: value }
        onChange({ cards: newCards })
    }

    const removeCard = (index: number) => {
        const newCards = cards.filter((_: any, i: number) => i !== index)
        onChange({ cards: newCards })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">區塊標題</label>
                <Input
                    value={props.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Top Destinations"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">列表按鈕文字</label>
                    <Input
                        value={props.headerButtonText || ''}
                        onChange={(e) => onChange({ headerButtonText: e.target.value })}
                        placeholder="Explore all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">列表按鈕連結</label>
                    <Input
                        value={props.headerButtonUrl || ''}
                        onChange={(e) => onChange({ headerButtonUrl: e.target.value })}
                        placeholder="#"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">每行顯示數量</label>
                <div className="flex gap-2">
                    {[2, 3, 4].map(num => (
                        <Button
                            key={num}
                            variant={props.columns === num ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onChange({ columns: num })}
                            type="button"
                        >
                            {num} 欄
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium">卡片列表 ({cards.length})</h4>
                    <Button size="sm" variant="outline" onClick={addCard} type="button">
                        <Plus className="w-4 h-4 mr-1" /> 新增
                    </Button>
                </div>

                <div className="space-y-4">
                    {cards.map((card: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-mono text-muted-foreground">#{index + 1}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => removeCard(index)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="col-span-2">
                                    <ImageInput
                                        value={card.imageUrl}
                                        onChange={(url) => updateCard(index, 'imageUrl', url)}
                                    />
                                </div>
                                <Input
                                    value={card.title}
                                    onChange={(e) => updateCard(index, 'title', e.target.value)}
                                    placeholder="標題"
                                    className="h-8 text-sm"
                                />
                                <Input
                                    value={card.subtitle || ''}
                                    onChange={(e) => updateCard(index, 'subtitle', e.target.value)}
                                    placeholder="副標題"
                                    className="h-8 text-sm"
                                />
                                <div className="col-span-2">
                                    <Input
                                        value={card.link || ''}
                                        onChange={(e) => updateCard(index, 'link', e.target.value)}
                                        placeholder="連結網址"
                                        className="h-8 text-sm"
                                    />
                                </div>
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
