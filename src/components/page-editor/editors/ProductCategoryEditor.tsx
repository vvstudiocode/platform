// 商品分類編輯器
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { ResponsiveControls, SpacingControls, ImageControls, AspectRatioControls } from '../responsive-controls'
import { AnimationControls } from '../animation-controls'
import { AlignmentButtons } from '../shared/AlignmentButtons'
import type { EditorProps } from '../shared/types'

export function ProductCategoryEditor({ props, onChange, tenantId }: EditorProps) {
    const [categories, setCategories] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const url = tenantId ? `/api/products?tenantId=${tenantId}` : '/api/products'
        fetch(url)
            .then(res => {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return res.json().then(data => {
                        if (!res.ok) throw new Error(data.error || 'Fetch failed')
                        return data
                    })
                }
                return res.text().then(text => {
                    throw new Error(`Expected JSON, got ${text.slice(0, 50)}...`)
                })
            })
            .then(data => {
                setCategories(data.categories || [])
                setLoading(false)
            })
            .catch(err => {
                console.error('載入分類失敗:', err.message)
                setLoading(false)
            })
    }, [tenantId])

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">區塊標題</label>
                <div className="space-y-2">
                    <Input placeholder="商品分類" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
                    <AlignmentButtons value={props.titleAlign || 'center'} onChange={(val) => onChange({ titleAlign: val })} />
                </div>
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-1">選擇分類</label>
                {loading ? (
                    <div className="text-sm text-muted-foreground">載入中...</div>
                ) : categories.length === 0 ? (
                    <div className="text-sm text-muted-foreground">尚無分類（請先在商品中設定分類）</div>
                ) : (
                    <select
                        value={props.category || ''}
                        onChange={(e) => onChange({ category: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">請選擇分類</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                )}
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">顯示數量</label>
                    <Input type="number" min="1" max="50" value={props.limit || 8} onChange={(e) => onChange({ limit: parseInt(e.target.value) || 8 })} />
                </div>
            </div>

            <ResponsiveControls
                layout={{
                    desktop: props.layoutDesktop || props.layout || 'grid',
                    mobile: props.layoutMobile || 'grid'
                }}
                columns={{
                    desktop: props.columnsDesktop || props.columns || 3,
                    mobile: props.columnsMobile || 1
                }}
                onChange={onChange}
            />
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

            <ImageControls
                objectFit={{
                    desktop: props.objectFitDesktop || 'cover',
                    mobile: props.objectFitMobile || 'cover'
                }}
                onChange={onChange}
            />

            <AspectRatioControls
                aspectRatio={{
                    desktop: props.aspectRatioDesktop || 'auto',
                    mobile: props.aspectRatioMobile || 'auto'
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
