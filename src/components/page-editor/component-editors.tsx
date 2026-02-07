// 完整功能的編輯器元件
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { ResponsiveControls, SpacingControls, ImageControls, AspectRatioControls } from './responsive-controls'
import { AnimationControls } from './animation-controls'
import { ImageInput } from './image-input'

// 0. Hero Banner 編輯器
export function HeroEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">標題</label>
                <Input placeholder="標題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-1">副標題</label>
                <Input placeholder="副標題" value={props.subtitle || ''} onChange={(e) => onChange({ subtitle: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-1">背景圖片網址</label>
                <ImageInput
                    value={props.backgroundUrl || ''}
                    onChange={(url) => onChange({ backgroundUrl: url })}
                    placeholder="https://..."
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">按鈕文字</label>
                    <Input placeholder="了解更多" value={props.buttonText || ''} onChange={(e) => onChange({ buttonText: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">按鈕連結</label>
                    <Input placeholder="https://..." value={props.buttonUrl || ''} onChange={(e) => onChange({ buttonUrl: e.target.value })} />
                </div>
            </div>

            <SpacingControls
                paddingY={{
                    desktop: props.paddingYDesktop ?? 64,
                    mobile: props.paddingYMobile ?? 32
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

            <ImageControls
                objectFit={{
                    desktop: props.objectFitDesktop || 'cover',
                    mobile: props.objectFitMobile || 'cover'
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

// 1. 輪播圖編輯器 - 整合圖片上傳
export function CarouselEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const images = props.images || []

    const addImage = () => {
        onChange({ images: [...images, { url: '', alt: '圖片', link: '' }] })
    }

    const removeImage = (index: number) => {
        onChange({ images: images.filter((_: any, i: number) => i !== index) })
    }

    const updateImage = (index: number, field: string, value: string) => {
        const newImages = [...images]
        newImages[index] = { ...newImages[index], [field]: value }
        onChange({ images: newImages })
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={props.autoplay ?? true}
                            onChange={(e) => onChange({ autoplay: e.target.checked })}
                            className="bg-background border-input rounded"
                        />
                        自動輪播
                    </label>
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">間隔(秒)</label>
                    <Input
                        type="number"
                        min="1"
                        max="60"
                        value={props.interval || 5}
                        onChange={(e) => onChange({ interval: parseInt(e.target.value) || 5 })}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">圖片列表</label>
                {images.map((img: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <ImageInput
                            value={img.url || ''}
                            onChange={(url) => updateImage(index, 'url', url)}
                            placeholder="圖片 URL"
                        />

                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input placeholder="圖片說明" value={img.alt || ''} onChange={(e) => updateImage(index, 'alt', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeImage(index)} className="p-2 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <Input placeholder="連結 (可選)" value={img.link || ''} onChange={(e) => updateImage(index, 'link', e.target.value)} />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addImage}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增圖片
                </button>
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
        </div >
    )
}

// 2. 圖文組合編輯器 - 整合圖片上傳
export function ImageTextEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">排版</label>
                <select
                    value={props.layout || 'left'}
                    onChange={(e) => onChange({ layout: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="left">圖片在左</option>
                    <option value="right">圖片在右</option>
                </select>
            </div>

            {/* 圖片 URL */}
            <div>
                <label className="block text-sm text-muted-foreground mb-1">圖片 URL</label>
                <ImageInput
                    value={props.imageUrl || ''}
                    onChange={(url) => onChange({ imageUrl: url })}
                    placeholder="https://..."
                />
            </div>

            <div>
                <label className="block text-sm text-muted-foreground mb-1">標題</label>
                <Input placeholder="標題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm text-muted-foreground mb-1">內容</label>
                <textarea
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={4}
                    placeholder="文字說明..."
                    value={props.content || ''}
                    onChange={(e) => onChange({ content: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">按鈕文字</label>
                    <Input placeholder="了解更多" value={props.buttonText || ''} onChange={(e) => onChange({ buttonText: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">按鈕連結</label>
                    <Input placeholder="https://..." value={props.buttonUrl || ''} onChange={(e) => onChange({ buttonUrl: e.target.value })} />
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
        </div >
    )
}

// 3. 文字組合編輯器 (Multi-column)
export function TextColumnsEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const columns = props.columns || []

    const addColumn = () => {
        onChange({ columns: [...columns, { title: '欄位', content: '內容' }] })
    }

    const removeColumn = (index: number) => {
        onChange({ columns: columns.filter((_: any, i: number) => i !== index) })
    }

    const updateColumn = (index: number, field: string, value: string) => {
        const newColumns = [...columns]
        newColumns[index] = { ...newColumns[index], [field]: value }
        onChange({ columns: newColumns })
    }

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">欄數</label>
                <select
                    value={props.columnCount || 3}
                    onChange={(e) => onChange({ columnCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="2">2 欄</option>
                    <option value="3">3 欄</option>
                    <option value="4">4 欄</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">欄位內容</label>
                {columns.map((col: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex gap-2">
                            <Input placeholder="欄位標題" value={col.title || ''} onChange={(e) => updateColumn(index, 'title', e.target.value)} />
                            <button type="button" onClick={() => removeColumn(index)} className="p-1 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <textarea
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            rows={2}
                            placeholder="欄位內容"
                            value={col.content || ''}
                            onChange={(e) => updateColumn(index, 'content', e.target.value)}
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addColumn}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增欄位
                </button>
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
        </div >
    )
}

// 8. 純文字/Rich Text 編輯器
export function TextEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    return (
        <div className="space-y-4">
            {/* 標題與副標題 */}
            <div className="space-y-3">
                <Input
                    placeholder="大標題"
                    value={props.title || ''}
                    onChange={(e) => onChange({ title: e.target.value })}
                    className="font-bold"
                />
                <Input
                    placeholder="副標題"
                    value={props.subtitle || ''}
                    onChange={(e) => onChange({ subtitle: e.target.value })}
                />
            </div>

            {/* 內容 */}
            <div>
                <label className="block text-sm text-muted-foreground mb-1">內容</label>
                <textarea
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={6}
                    placeholder="輸入文字內容..."
                    value={props.content || ''}
                    onChange={(e) => onChange({ content: e.target.value })}
                />
            </div>

            {/* 樣式設定 (排版與顏色) */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">對齊方式</label>
                    <AlignmentButtons value={props.align || 'center'} onChange={(val) => onChange({ align: val })} />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">文字顏色</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={props.textColor || '#000000'}
                            onChange={(e) => onChange({ textColor: e.target.value })}
                            className="h-7 w-7 rounded cursor-pointer bg-transparent border-none p-0"
                        />
                        <span className="text-xs text-muted-foreground uppercase">{props.textColor || '#000'}</span>
                    </div>
                </div>
            </div>

            {/* 按鈕設定 */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">顯示按鈕</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={props.showButton || false}
                            onChange={(e) => onChange({ showButton: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {props.showButton && (
                    <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                        <Input
                            placeholder="按鈕文字"
                            value={props.buttonText || ''}
                            onChange={(e) => onChange({ buttonText: e.target.value })}
                        />
                        <Input
                            placeholder="連結 URL"
                            value={props.buttonUrl || ''}
                            onChange={(e) => onChange({ buttonUrl: e.target.value })}
                        />
                    </div>
                )}
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
        </div >
    )
}

// 4. 圖片組合編輯器 - 整合圖片上傳
export function ImageGridEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const images = props.images || []

    const addImage = () => {
        onChange({ images: [...images, { url: '', alt: '圖片', link: '' }] })
    }

    const removeImage = (index: number) => {
        onChange({ images: images.filter((_: any, i: number) => i !== index) })
    }

    const updateImage = (index: number, field: string, value: string) => {
        const newImages = [...images]
        newImages[index] = { ...newImages[index], [field]: value }
        onChange({ images: newImages })
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">欄數</label>
                    <select
                        value={props.columns || 3}
                        onChange={(e) => onChange({ columns: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="2">2 欄</option>
                        <option value="3">3 欄</option>
                        <option value="4">4 欄</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">間距 (px)</label>
                    <Input
                        type="number"
                        min="0"
                        max="64"
                        value={props.gap || 16}
                        onChange={(e) => onChange({ gap: parseInt(e.target.value) || 16 })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">圖片列表</label>
                {images.map((img: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <ImageInput
                            value={img.url || ''}
                            onChange={(url) => updateImage(index, 'url', url)}
                            placeholder="圖片 URL"
                        />

                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input placeholder="圖片說明" value={img.alt || ''} onChange={(e) => updateImage(index, 'alt', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeImage(index)} className="p-2 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <Input placeholder="連結 (可選)" value={img.link || ''} onChange={(e) => updateImage(index, 'link', e.target.value)} />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addImage}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增圖片
                </button>
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

// Helper for alignment buttons
function AlignmentButtons({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    return (
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
            {[
                { value: 'left', label: '左' },
                { value: 'center', label: '中' },
                { value: 'right', label: '右' },
            ].map((align) => (
                <button
                    key={align.value}
                    type="button"
                    onClick={() => onChange(align.value)}
                    className={`flex-1 py-1.5 text-xs rounded transition-colors ${(value || 'center') === align.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    {align.label}
                </button>
            ))}
        </div>
    )
}

// ... existing code ...

// 5. 商品列表編輯器 - 動態載入商品
export function ProductListEditor({ props, onChange, tenantId }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void; tenantId?: string }) {
    // ... existing hooks ...
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const selectedIds = props.productIds || []

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
                setProducts(data.products || [])
                setCategories(data.categories || [])
                setLoading(false)
            })
            .catch(err => {
                console.error('載入商品失敗:', err.message)
                setLoading(false)
            })
    }, [tenantId])

    const toggleProduct = (id: string) => {
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter((pid: string) => pid !== id)
            : [...selectedIds, id]
        onChange({ productIds: newIds })
    }

    const filteredProducts = products.filter(p => {
        const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchCategory = !filterCategory || p.category === filterCategory
        return matchSearch && matchCategory
    })

    const handleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            onChange({ productIds: [] })
        } else {
            const allIds = filteredProducts.map(p => p.id)
            onChange({ productIds: allIds })
        }
    }

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">區塊標題</label>
                <div className="space-y-2">
                    <Input placeholder="精選商品" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
                    <AlignmentButtons value={props.titleAlign || 'center'} onChange={(val) => onChange({ titleAlign: val })} />
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

            {/* 商品選擇區 */}
            <div className="border border-border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted border-b border-border">
                    <div className="flex gap-2 mb-2">
                        <Input
                            placeholder="搜尋商品..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">全部分類</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>已選擇 {selectedIds.length} 個商品</span>
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="text-primary hover:text-primary/90 font-medium"
                        >
                            {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? '取消全選' : '全選'}
                        </button>
                    </div>
                </div>

                <div className="max-h-48 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-muted-foreground">載入中...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">無商品</div>
                    ) : (
                        filteredProducts.map(product => (
                            <label
                                key={product.id}
                                className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/50 border-b border-border/50 last:border-0 ${selectedIds.includes(product.id) ? 'bg-primary/10' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(product.id)}
                                    onChange={() => toggleProduct(product.id)}
                                    className="accent-primary"
                                />
                                {product.image_url && (
                                    <img src={product.image_url} alt="" className="w-8 h-8 object-cover rounded" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-foreground truncate">{product.name}</div>
                                    <div className="text-xs text-muted-foreground">{product.category || '未分類'} · NT${product.price}</div>
                                </div>
                            </label>
                        ))
                    )}
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

// 6. 商品分類編輯器 - 動態載入分類
export function ProductCategoryEditor({ props, onChange, tenantId }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void; tenantId?: string }) {
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

// 7. 商品輪播編輯器 - 動態載入商品
export function ProductCarouselEditor({ props, onChange, tenantId }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void; tenantId?: string }) {
    // ... existing hooks ...
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const selectedIds = props.productIds || []

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
                setProducts(data.products || [])
                setCategories(data.categories || [])
                setLoading(false)
            })
            .catch(err => {
                console.error('載入商品失敗:', err.message)
                setLoading(false)
            })
    }, [tenantId])

    const toggleProduct = (id: string) => {
        // Enforce max 8 items
        const isSelected = selectedIds.includes(id)

        if (!isSelected && selectedIds.length >= 8) {
            alert('最多只能選擇 8 個商品')
            return
        }

        const newIds = isSelected
            ? selectedIds.filter((pid: string) => pid !== id)
            : [...selectedIds, id]
        onChange({ productIds: newIds })
    }

    const filteredProducts = products.filter(p => {
        const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchCategory = !filterCategory || p.category === filterCategory
        return matchSearch && matchCategory
    })

    const handleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            onChange({ productIds: [] })
        } else {
            // Limit to first 8 if selecting all? Or just select all then warn?
            // Let's safe guard to 8
            const allFilteredIds = filteredProducts.map(p => p.id)
            const remainingSlots = 8 - selectedIds.length
            if (remainingSlots <= 0 && selectedIds.length > 0) { // Already full or Over
                onChange({ productIds: [] }) // Toggle off
                return
            }

            // Just basic toggle off if all matches are selected
            // But if filtered list is > 8, we should probably only take 8.
            // For now, simple implementation logic:
            onChange({ productIds: allFilteredIds.slice(0, 8) })
        }
    }

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">區塊標題</label>
                <div className="space-y-2">
                    <Input placeholder="熱門商品" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
                    <AlignmentButtons value={props.titleAlign || 'center'} onChange={(val) => onChange({ titleAlign: val })} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={props.autoplay ?? true}
                            onChange={(e) => onChange({ autoplay: e.target.checked })}
                            className="bg-background border-input rounded"
                        />
                        自動輪播
                    </label>
                </div>
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">輪播速度 (秒)</label>
                    <Input type="number" min="1" max="60" value={props.interval || 5} onChange={(e) => onChange({ interval: parseInt(e.target.value) || 5 })} />
                </div>
            </div>

            {/* 商品選擇區 */}
            <div className="border border-border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted border-b border-border">
                    <div className="flex gap-2 mb-2">
                        <Input
                            placeholder="搜尋商品..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">全部分類</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>已選擇 {selectedIds.length} / 8 個商品</span>
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="text-primary hover:text-primary/90 font-medium"
                        >
                            {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? '取消全選' : '全選 (最多8個)'}
                        </button>
                    </div>
                </div>

                <div className="max-h-48 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-muted-foreground">載入中...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">無商品</div>
                    ) : (
                        filteredProducts.map(product => (
                            <label
                                key={product.id}
                                className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/50 border-b border-border/50 last:border-0 ${selectedIds.includes(product.id) ? 'bg-primary/10' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(product.id)}
                                    onChange={() => toggleProduct(product.id)}
                                    className="accent-primary"
                                />
                                {product.image_url && (
                                    <img src={product.image_url} alt="" className="w-8 h-8 object-cover rounded" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-foreground truncate">{product.name}</div>
                                    <div className="text-xs text-muted-foreground">{product.category || '未分類'} · NT${product.price}</div>
                                </div>
                            </label>
                        ))
                    )}
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

// 8. 特色區塊編輯器
export function FeaturesEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const items = props.items || []

    const addItem = () => {
        onChange({ items: [...items, { icon: '✨', title: '特色', description: '特色說明' }] })
    }

    const removeItem = (index: number) => {
        onChange({ items: items.filter((_: any, i: number) => i !== index) })
    }

    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        onChange({ items: newItems })
    }

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">區塊標題</label>
                <div className="space-y-2">
                    <Input placeholder="標題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
                    <AlignmentButtons value={props.titleAlign || 'center'} onChange={(val) => onChange({ titleAlign: val })} />
                </div>
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">特色項目</label>
                {items.map((item: any, index: number) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="圖標 (emoji)" value={item.icon || ''} onChange={(e) => updateItem(index, 'icon', e.target.value)} />
                                <Input placeholder="標題" value={item.title || ''} onChange={(e) => updateItem(index, 'title', e.target.value)} />
                            </div>
                            <Input placeholder="說明" value={item.description || ''} onChange={(e) => updateItem(index, 'description', e.target.value)} />
                        </div>
                        <button type="button" onClick={() => removeItem(index)} className="p-1 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addItem}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增特色
                </button>
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

// 9. 常見問題編輯器
export function FAQEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const items = props.items || []

    const addItem = () => {
        onChange({ items: [...items, { question: '問題', answer: '答案' }] })
    }

    const removeItem = (index: number) => {
        onChange({ items: items.filter((_: any, i: number) => i !== index) })
    }

    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        onChange({ items: newItems })
    }

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-muted-foreground mb-1">區塊標題</label>
                <div className="space-y-2">
                    <Input placeholder="常見問題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
                    <AlignmentButtons value={props.titleAlign || 'center'} onChange={(val) => onChange({ titleAlign: val })} />
                </div>
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">問答項目</label>
                {items.map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input placeholder="問題" value={item.question || ''} onChange={(e) => updateItem(index, 'question', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeItem(index)} className="p-1 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <textarea
                            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            rows={2}
                            placeholder="答案"
                            value={item.answer || ''}
                            onChange={(e) => updateItem(index, 'answer', e.target.value)}
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addItem}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增問答
                </button>
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
// ... existing code ...

// 9. 環狀輪播編輯器
export function CircularCarouselEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const images = props.images || []

    const addImage = () => {
        onChange({ images: [...images, { url: '', alt: '圖片', link: '' }] })
    }

    const removeImage = (index: number) => {
        onChange({ images: images.filter((_: any, i: number) => i !== index) })
    }

    const updateImage = (index: number, field: string, value: string) => {
        const newImages = [...images]
        newImages[index] = { ...newImages[index], [field]: value }
        onChange({ images: newImages })
    }

    return (
        <div className="space-y-3">
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
                <label className="text-sm font-medium">基本設定</label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <input
                                type="checkbox"
                                checked={props.autoRotate ?? true}
                                onChange={(e) => onChange({ autoRotate: e.target.checked })}
                                className="bg-background border-input rounded"
                            />
                            自動旋轉
                        </label>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">半徑 (px)</label>
                        <Input
                            type="number"
                            value={props.radius || 300}
                            onChange={(e) => onChange({ radius: parseInt(e.target.value) || 300 })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">高度 (px)</label>
                        <Input
                            type="number"
                            value={props.height || 400}
                            onChange={(e) => onChange({ height: parseInt(e.target.value) || 400 })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">項目寬度 (px)</label>
                        <Input
                            type="number"
                            value={props.itemWidth || 200}
                            onChange={(e) => onChange({ itemWidth: parseInt(e.target.value) || 200 })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">項目高度 (px)</label>
                        <Input
                            type="number"
                            value={props.itemHeight || 300}
                            onChange={(e) => onChange({ itemHeight: parseInt(e.target.value) || 300 })}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm text-muted-foreground">圖片列表</label>
                {images.map((img: any, index: number) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <ImageInput
                            value={img.url || ''}
                            onChange={(url) => updateImage(index, 'url', url)}
                            placeholder="圖片 URL"
                        />

                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input placeholder="圖片說明" value={img.alt || ''} onChange={(e) => updateImage(index, 'alt', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeImage(index)} className="p-2 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <Input placeholder="連結 (可選)" value={img.link || ''} onChange={(e) => updateImage(index, 'link', e.target.value)} />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addImage}
                    className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                    + 新增圖片
                </button>
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
// 11. Showcase Slider 編輯器
export function ShowcaseSliderEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const slides = props.slides || []

    const addSlide = () => {
        onChange({
            slides: [...slides, {
                image: '',
                title: 'New Slide',
                subtitle: 'Subtitle',
                buttonText: 'View More',
                link: ''
            }]
        })
    }

    const removeSlide = (index: number) => {
        onChange({ slides: slides.filter((_: any, i: number) => i !== index) })
    }

    const updateSlide = (index: number, field: string, value: string) => {
        const newSlides = [...slides]
        newSlides[index] = { ...newSlides[index], [field]: value }
        onChange({ slides: newSlides })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={props.autoplay ?? true}
                    onChange={(e) => onChange({ autoplay: e.target.checked })}
                    className="bg-background border-input rounded"
                />
                <label className="text-sm text-muted-foreground">自動輪播</label>
            </div>

            <div className="space-y-4">
                {slides.map((slide: any, index: number) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3 border border-border">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Slide {index + 1}</span>
                            <button onClick={() => removeSlide(index)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <ImageInput
                            value={slide.image || ''}
                            onChange={(url) => updateSlide(index, 'image', url)}
                            placeholder="圖片 URL"
                        />

                        <Input
                            placeholder="標題"
                            value={slide.title || ''}
                            onChange={(e) => updateSlide(index, 'title', e.target.value)}
                        />
                        <Input
                            placeholder="副標題"
                            value={slide.subtitle || ''}
                            onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                placeholder="按鈕文字"
                                value={slide.buttonText || ''}
                                onChange={(e) => updateSlide(index, 'buttonText', e.target.value)}
                            />
                            <Input
                                placeholder="連結"
                                value={slide.link || ''}
                                onChange={(e) => updateSlide(index, 'link', e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addSlide}
                className="w-full py-2 border-2 border-dashed border-input rounded-lg text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
            >
                + 新增投影片
            </button>

            <div className="space-y-2 pt-4 border-t border-border">
                <label className="text-sm text-muted-foreground">高度 (例如: 100vh, 600px)</label>
                <Input
                    value={props.height || '100vh'}
                    onChange={(e) => onChange({ height: e.target.value })}
                />
            </div>

            <div className="space-y-2 pt-2">
                <label className="block text-sm text-muted-foreground mb-1">按鈕 Hover 顏色</label>
                <div className="flex gap-2 items-center">
                    <input
                        type="color"
                        value={props.buttonHoverColor || '#e11d48'}
                        onChange={(e) => onChange({ buttonHoverColor: e.target.value })}
                        className="h-9 w-16 p-1 rounded cursor-pointer bg-background border border-input"
                    />
                    <span className="text-sm text-muted-foreground uppercase">{props.buttonHoverColor || '#e11d48'}</span>
                </div>
            </div>

            <SpacingControls
                paddingY={{
                    desktop: props.paddingYDesktop ?? 0,
                    mobile: props.paddingYMobile ?? 0
                }}
                onChange={onChange}
            />
        </div>
    )
}
