import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import { Trash2, Plus } from 'lucide-react'
import type { EditorProps } from '../shared/types'

export function PortfolioGridEditor({ props, onChange }: EditorProps) {
    const items = props.items || []

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        onChange({ items: newItems })
    }

    const addItem = () => {
        onChange({
            items: [
                ...items,
                {
                    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop',
                    title: 'New Project',
                    category: 'Category',
                    link: '#',
                    isWide: false
                }
            ]
        })
    }

    const removeItem = (index: number) => {
        const newItems = [...items]
        newItems.splice(index, 1)
        onChange({ items: newItems })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium">區塊標題</label>
                <Input
                    value={props.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Selected Works"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">區塊描述</label>
                <Textarea
                    value={props.subtitle || ''}
                    onChange={(e) => onChange({ subtitle: e.target.value })}
                    placeholder="Describe your work..."
                    rows={2}
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-foreground/80">作品列表</h4>
                    <Button variant="outline" size="sm" onClick={addItem}>
                        <Plus className="w-3 h-3 mr-1" /> 新增
                    </Button>
                </div>
                <div className="space-y-4">
                    {items.map((item: any, index: number) => (
                        <div key={index} className="space-y-3 p-4 border rounded-lg bg-muted/20">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold">Project {index + 1}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">圖片</label>
                                <ImageInput
                                    value={item.image}
                                    onChange={(url) => updateItem(index, 'image', url)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">標題</label>
                                    <Input
                                        value={item.title}
                                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                                        placeholder="標題"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">分類</label>
                                    <Input
                                        value={item.category}
                                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                                        placeholder="例如: Residential"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">連結</label>
                                <Input
                                    value={item.link}
                                    onChange={(e) => updateItem(index, 'link', e.target.value)}
                                    placeholder="#"
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <Switch
                                    id={`wide-${index}`}
                                    checked={item.isWide || false}
                                    onCheckedChange={(checked) => updateItem(index, 'isWide', checked)}
                                />
                                <label htmlFor={`wide-${index}`} className="text-xs cursor-pointer">
                                    寬版顯示 (跨兩欄)
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="show-view-all"
                        checked={props.showViewAll !== false}
                        onCheckedChange={(checked) => onChange({ showViewAll: checked })}
                    />
                    <label htmlFor="show-view-all" className="text-sm cursor-pointer font-medium">
                        顯示「查看更多」卡片
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">下方按鈕文字</label>
                    <Input
                        value={props.viewAllText || ''}
                        onChange={(e) => onChange({ viewAllText: e.target.value })}
                        placeholder="See More Projects"
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
