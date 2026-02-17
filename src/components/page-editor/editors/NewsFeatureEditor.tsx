
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { SpacingControls, FontSizeControls } from '../responsive-controls'
import type { EditorProps } from '../shared/types'
import { SortableProductList } from '../shared/SortableProductList'

export function NewsFeatureEditor({ props, onChange, tenantId }: EditorProps) {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const selectedIds = props.productIds || []

    // Fetch all products for selection
    useEffect(() => {
        const url = tenantId ? `/api/products?tenantId=${tenantId}` : '/api/products'
        fetch(url)
            .then(res => {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return res.json().then(data => data)
                }
                return res.text().then(text => { throw new Error('Not JSON') })
            })
            .then(data => {
                setProducts(data.products || [])
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

    const filteredProducts = products.filter(p =>
        !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-4">
            {/* 標題設定 */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                <h4 className="text-sm font-medium">標題設定</h4>
                <div className="space-y-2">
                    <div>
                        <label className="text-xs text-muted-foreground">主標題 (TOP/BOTTOM)</label>
                        <Input
                            placeholder="TOP"
                            value={props.sectionTitle || ''}
                            onChange={(e) => onChange({ sectionTitle: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">品牌副標</label>
                        <Input
                            placeholder="NOTHING BUT..."
                            value={props.brandText || ''}
                            onChange={(e) => onChange({ brandText: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* 文字設定 */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                <h4 className="text-sm font-medium">區塊文字</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-muted-foreground">左上文字 (Desktop)</label>
                        <Input
                            placeholder="NEW ARRIVALS"
                            value={props.newArrivalsText || ''}
                            onChange={(e) => onChange({ newArrivalsText: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">右上文字 (Desktop)</label>
                        <Input
                            placeholder="LOOKBOOK"
                            value={props.lookbookText || ''}
                            onChange={(e) => onChange({ lookbookText: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* 樣式設定 */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                <h4 className="text-sm font-medium">樣式設定</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground block">文字顏色</label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={props.textColor || '#333333'}
                                onChange={(e) => onChange({ textColor: e.target.value })}
                                className="w-10 h-8 p-1 cursor-pointer"
                            />
                            <Input
                                value={props.textColor || '#333333'}
                                onChange={(e) => onChange({ textColor: e.target.value })}
                                className="flex-1 h-8 text-xs"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground block">主要顏色</label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={props.primaryColor || '#5A7ABC'}
                                onChange={(e) => onChange({ primaryColor: e.target.value })}
                                className="w-10 h-8 p-1 cursor-pointer"
                            />
                            <Input
                                value={props.primaryColor || '#5A7ABC'}
                                onChange={(e) => onChange({ primaryColor: e.target.value })}
                                className="flex-1 h-8 text-xs"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground block">背景顏色</label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={props.backgroundColor || '#FFFDF7'}
                            onChange={(e) => onChange({ backgroundColor: e.target.value })}
                            className="w-10 h-8 p-1 cursor-pointer"
                        />
                        <Input
                            value={props.backgroundColor || '#FFFDF7'}
                            onChange={(e) => onChange({ backgroundColor: e.target.value })}
                            className="flex-1 h-8 text-xs"
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

                <FontSizeControls
                    label="主標題大小"
                    fontSize={{
                        desktop: props.fontSizeDesktop ?? 128,
                        mobile: props.fontSizeMobile ?? 64
                    }}
                    onChange={onChange}
                />
            </div>

            {/* 商品選擇 */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">選擇商品 (首項為主打)</label>
                    <span className="text-xs text-muted-foreground">拖曳可排序</span>
                </div>

                <SortableProductList
                    value={selectedIds}
                    products={products}
                    onChange={(ids) => onChange({ productIds: ids })}
                />

                <div className="border rounded-lg overflow-hidden">
                    <div className="p-2 border-b bg-muted/50">
                        <Input
                            placeholder="搜尋商品..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1">
                        {loading ? (
                            <div className="p-4 text-center text-xs text-muted-foreground">載入中...</div>
                        ) : filteredProducts.map(p => (
                            <div
                                key={p.id}
                                className={`flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer rounded-sm ${selectedIds.includes(p.id) ? 'opacity-50' : ''}`}
                                onClick={() => toggleProduct(p.id)}
                            >
                                <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedIds.includes(p.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-gray-300'}`}>
                                    {selectedIds.includes(p.id) && <span className="text-[10px]">✓</span>}
                                </div>
                                <img src={p.image_url || undefined} className="w-8 h-8 object-cover rounded bg-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs truncate font-medium">{p.name}</div>
                                    <div className="text-[10px] text-muted-foreground">NT$ {p.price}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
