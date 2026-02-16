import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SpacingControls } from '../responsive-controls'
import { ImageInput } from '../image-input'
import type { EditorProps } from '../shared/types'

export function TestimonialShowcaseEditor({ props, onChange }: EditorProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">區塊標題</label>
                <Input
                    value={props.sectionTitle || ''}
                    onChange={(e) => onChange({ sectionTitle: e.target.value })}
                    placeholder="Trekker's Highlights"
                />
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">用戶資訊</h4>
                <div className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">頭像</label>
                            <ImageInput
                                value={props.userAvatar || ''}
                                onChange={(url) => onChange({ userAvatar: url })}
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-foreground">姓名</label>
                                <Input
                                    value={props.userName || ''}
                                    onChange={(e) => onChange({ userName: e.target.value })}
                                    placeholder="姓名"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-foreground">角色/描述</label>
                                <Input
                                    value={props.userRole || ''}
                                    onChange={(e) => onChange({ userRole: e.target.value })}
                                    placeholder="角色/描述 (e.g. Traveler)"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3">
                        <label className="text-sm font-medium">評分</label>
                        <Select
                            value={String(props.rating || 5)}
                            onValueChange={(val) => onChange({ rating: Number(val) })}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <SelectItem key={num} value={String(num)}>{num} 星</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">評價內容</h4>
                <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">標題</label>
                    <Input
                        value={props.quoteTitle || ''}
                        onChange={(e) => onChange({ quoteTitle: e.target.value })}
                        placeholder="An Unforgettable Journey..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">內容</label>
                    <Textarea
                        value={props.quote || ''}
                        onChange={(e) => onChange({ quote: e.target.value })}
                        placeholder="評價文字..."
                        rows={4}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">右側圖庫</h4>
                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">圖片 1 (左側靜態)</label>
                    <ImageInput
                        value={props.image1 || ''}
                        onChange={(url) => onChange({ image1: url })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">圖片 2 (右側靜態/影片)</label>
                    <ImageInput
                        value={props.image2 || ''}
                        onChange={(url) => onChange({ image2: url })}
                    />
                    <Input
                        value={props.image2Text || ''}
                        onChange={(e) => onChange({ image2Text: e.target.value })}
                        placeholder="圖片說明文字"
                        className="mt-1"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">按鈕設定</h4>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        value={props.headerButtonText || ''}
                        onChange={(e) => onChange({ headerButtonText: e.target.value })}
                        placeholder="See more highlights"
                    />
                    <Input
                        value={props.headerButtonUrl || ''}
                        onChange={(e) => onChange({ headerButtonUrl: e.target.value })}
                        placeholder="連結"
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
