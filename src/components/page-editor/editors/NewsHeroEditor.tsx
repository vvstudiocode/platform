
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ImageInput } from '../image-input'
import type { EditorProps } from '../shared/types'
import { Trash2, Image } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpacingControls } from '../responsive-controls'

export function NewsHeroEditor({ props, onChange }: EditorProps) {
    const images = props.images || []

    // Helper to update specific image at index
    const updateImage = (index: number, url: string) => {
        const newImages = [...images]
        newImages[index] = url
        onChange({ images: newImages })
    }

    return (
        <div className="space-y-4">
            <Tabs defaultValue="content" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="content">內容設定</TabsTrigger>
                    <TabsTrigger value="images">圖片網格</TabsTrigger>
                    <TabsTrigger value="style">樣式設定</TabsTrigger>
                </TabsList>

                {/* Content Settings */}
                <TabsContent value="content" className="space-y-4 mt-4">
                    <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase">主視覺文字</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs">主標題 (SPORTS)</label>
                                <Input
                                    value={props.title || ''}
                                    onChange={(e) => onChange({ title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs">副標題 (入夏特輯)</label>
                                <Input
                                    value={props.subtitle || ''}
                                    onChange={(e) => onChange({ subtitle: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase">活動數據</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs">數字 (89)</label>
                                <Input
                                    value={props.number || ''}
                                    onChange={(e) => onChange({ number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs">單位 (折)</label>
                                <Input
                                    value={props.unit || ''}
                                    onChange={(e) => onChange({ unit: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs">備註 (新品3件)</label>
                                <Input
                                    value={props.note || ''}
                                    onChange={(e) => onChange({ note: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase">描述區塊</h4>
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <label className="text-xs">標題 (Lookbook)</label>
                                <Input
                                    value={props.descriptionTitle || ''}
                                    onChange={(e) => onChange({ descriptionTitle: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs">內文</label>
                                <Textarea
                                    value={props.description || ''}
                                    onChange={(e) => onChange({ description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase">頁首資訊</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs">品牌</label>
                                <Input
                                    value={props.brandText || ''}
                                    onChange={(e) => onChange({ brandText: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs">日期範圍</label>
                                <Input
                                    value={props.date || ''}
                                    onChange={(e) => onChange({ date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Image Settings */}
                <TabsContent value="images" className="mt-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium">圖片網格 (9張)</label>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="relative aspect-[3/4] bg-muted/20 rounded overflow-hidden group border hover:border-primary transition-colors">
                                        {images[i] ? (
                                            <>
                                                <img src={images[i]} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => updateImage(i, "")}
                                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                                <Image className="w-4 h-4 mb-1 opacity-50" />
                                                <span className="text-[10px]">{i + 1}</span>
                                            </div>
                                        )}
                                    </div>
                                    <ImageInput
                                        value={images[i] || ''}
                                        onChange={(url) => updateImage(i, url)}
                                        className="h-7 text-xs px-2"
                                        placeholder={`IMG ${i + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* Style Settings */}
                <TabsContent value="style" className="space-y-4 mt-4">
                    <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase">主題配色</h4>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs">主色調 (標題、卡片背景)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={props.primaryColor || '#5c7cbc'}
                                        onChange={(e) => onChange({ primaryColor: e.target.value })}
                                        className="w-8 h-8 rounded border cursor-pointer"
                                    />
                                    <Input
                                        value={props.primaryColor || '#5c7cbc'}
                                        onChange={(e) => onChange({ primaryColor: e.target.value })}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs">背景色 (Background)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={props.backgroundColor || '#ffffff'}
                                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                                        className="w-8 h-8 rounded border cursor-pointer"
                                    />
                                    <Input
                                        value={props.backgroundColor || '#ffffff'}
                                        onChange={(e) => onChange({ backgroundColor: e.target.value })}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs">文字色 (Text)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={props.textColor || '#333333'}
                                        onChange={(e) => onChange({ textColor: e.target.value })}
                                        className="w-8 h-8 rounded border cursor-pointer"
                                    />
                                    <Input
                                        value={props.textColor || '#333333'}
                                        onChange={(e) => onChange({ textColor: e.target.value })}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 border rounded-lg bg-muted/20 space-y-3">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase">間距設定</h4>
                        <SpacingControls
                            paddingY={{
                                desktop: props.paddingYDesktop ?? 64,
                                mobile: props.paddingYMobile ?? 32
                            }}
                            onChange={onChange}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
