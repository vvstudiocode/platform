// 商品輪播編輯器
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { SpacingControls, ImageControls, AspectRatioControls } from '../responsive-controls'
import { AnimationControls } from '../animation-controls'
import { AlignmentButtons } from '../shared/AlignmentButtons'
import type { EditorProps } from '../shared/types'

export function ProductCarouselEditor({ props, onChange, tenantId }: EditorProps) {
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
            const allFilteredIds = filteredProducts.map(p => p.id)
            const remainingSlots = 8 - selectedIds.length

            if (remainingSlots <= 0 && selectedIds.length > 0) {
                onChange({ productIds: [] })
                return
            }

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
