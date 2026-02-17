import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import type { EditorProps } from '../shared/types'

export function MagazineGridEditor({ props, onChange }: EditorProps) {
    const featuredStory = props.featuredStory || {}
    const sideStories = props.sideStories || []

    const updateFeatured = (field: string, value: any) => {
        onChange({ featuredStory: { ...featuredStory, [field]: value } })
    }

    const addSideStory = () => {
        onChange({
            sideStories: [
                ...sideStories,
                {
                    title: 'New Story',
                    category: 'Category',
                    date: 'Date',
                    imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80',
                    link: '#'
                }
            ]
        })
    }

    const updateSideStory = (index: number, field: string, value: any) => {
        const newStories = [...sideStories]
        newStories[index] = { ...newStories[index], [field]: value }
        onChange({ sideStories: newStories })
    }

    const removeSideStory = (index: number) => {
        const newStories = sideStories.filter((_: any, i: number) => i !== index)
        onChange({ sideStories: newStories })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">區塊標題</label>
                <Input
                    value={props.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Latest Stories"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">列表按鈕文字</label>
                    <Input
                        value={props.headerButtonText || ''}
                        onChange={(e) => onChange({ headerButtonText: e.target.value })}
                        placeholder="Read more"
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

            <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">主打文章 (左側大圖)</h4>
                <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                    <ImageInput
                        value={featuredStory.imageUrl || ''}
                        onChange={(url) => updateFeatured('imageUrl', url)}
                    />
                    <Input
                        value={featuredStory.link || ''}
                        onChange={(e) => updateFeatured('link', e.target.value)}
                        placeholder="連結網址"
                    />
                    <Input
                        value={featuredStory.category || ''}
                        onChange={(e) => updateFeatured('category', e.target.value)}
                        placeholder="分類標籤 (e.g. Food & Drink)"
                    />
                    <Input
                        value={featuredStory.title || ''}
                        onChange={(e) => updateFeatured('title', e.target.value)}
                        placeholder="文章標題"
                    />
                    <Input
                        value={featuredStory.date || ''}
                        onChange={(e) => updateFeatured('date', e.target.value)}
                        placeholder="日期/閱讀時間"
                    />
                    <Textarea
                        value={featuredStory.excerpt || ''}
                        onChange={(e) => updateFeatured('excerpt', e.target.value)}
                        placeholder="摘要內容"
                        rows={3}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium">側邊列表 ({sideStories.length})</h4>
                    <Button size="sm" variant="outline" onClick={addSideStory} type="button">
                        <Plus className="w-4 h-4 mr-1" /> 新增
                    </Button>
                </div>

                <div className="space-y-4">
                    {sideStories.map((story: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-mono text-muted-foreground">#{index + 1}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => removeSideStory(index)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">圖片</label>
                                    <ImageInput
                                        value={story.imageUrl}
                                        onChange={(url) => updateSideStory(index, 'imageUrl', url)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">連結</label>
                                    <Input
                                        value={story.link || ''}
                                        onChange={(e) => updateSideStory(index, 'link', e.target.value)}
                                        placeholder="連結"
                                        className="h-8 text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">分類</label>
                                        <Input
                                            value={story.category || ''}
                                            onChange={(e) => updateSideStory(index, 'category', e.target.value)}
                                            placeholder="分類"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">日期</label>
                                        <Input
                                            value={story.date || ''}
                                            onChange={(e) => updateSideStory(index, 'date', e.target.value)}
                                            placeholder="日期"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">標題</label>
                                    <Input
                                        value={story.title}
                                        onChange={(e) => updateSideStory(index, 'title', e.target.value)}
                                        placeholder="標題"
                                        className="h-8 text-sm"
                                    />
                                </div>
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
