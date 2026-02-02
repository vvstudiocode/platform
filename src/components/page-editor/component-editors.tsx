// 完整功能的編輯器元件
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'

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
                    <label className="flex items-center gap-2 text-sm text-zinc-400">
                        <input
                            type="checkbox"
                            checked={props.autoplay ?? true}
                            onChange={(e) => onChange({ autoplay: e.target.checked })}
                            className="bg-zinc-700 border-zinc-600"
                        />
                        自動輪播
                    </label>
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">間隔(秒)</label>
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
                <label className="block text-sm text-zinc-400">圖片列表</label>
                {images.map((img: any, index: number) => (
                    <div key={index} className="p-3 bg-zinc-700/50 rounded-lg space-y-2">
                        <Input placeholder="圖片 URL" value={img.url || ''} onChange={(e) => updateImage(index, 'url', e.target.value)} />

                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input placeholder="圖片說明" value={img.alt || ''} onChange={(e) => updateImage(index, 'alt', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeImage(index)} className="p-2 text-zinc-500 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <Input placeholder="連結 (可選)" value={img.link || ''} onChange={(e) => updateImage(index, 'link', e.target.value)} />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addImage}
                    className="w-full py-2 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                >
                    + 新增圖片
                </button>
            </div>
        </div>
    )
}

// 2. 圖文組合編輯器 - 整合圖片上傳
export function ImageTextEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-zinc-400 mb-1">排版</label>
                <select
                    value={props.layout || 'left'}
                    onChange={(e) => onChange({ layout: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                >
                    <option value="left">圖片在左</option>
                    <option value="right">圖片在右</option>
                </select>
            </div>

            {/* 圖片 URL */}
            <div>
                <label className="block text-sm text-zinc-400 mb-1">圖片 URL</label>
                <Input placeholder="https://..." value={props.imageUrl || ''} onChange={(e) => onChange({ imageUrl: e.target.value })} />
            </div>

            <div>
                <label className="block text-sm text-zinc-400 mb-1">標題</label>
                <Input placeholder="標題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm text-zinc-400 mb-1">內容</label>
                <textarea
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder:text-zinc-400"
                    rows={4}
                    placeholder="文字說明..."
                    value={props.content || ''}
                    onChange={(e) => onChange({ content: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">按鈕文字</label>
                    <Input placeholder="了解更多" value={props.buttonText || ''} onChange={(e) => onChange({ buttonText: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">按鈕連結</label>
                    <Input placeholder="https://..." value={props.buttonUrl || ''} onChange={(e) => onChange({ buttonUrl: e.target.value })} />
                </div>
            </div>
        </div>
    )
}

// 3. 文字組合編輯器
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
                <label className="block text-sm text-zinc-400 mb-1">欄數</label>
                <select
                    value={props.columnCount || 3}
                    onChange={(e) => onChange({ columnCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                >
                    <option value="2">2 欄</option>
                    <option value="3">3 欄</option>
                    <option value="4">4 欄</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-zinc-400">欄位內容</label>
                {columns.map((col: any, index: number) => (
                    <div key={index} className="p-3 bg-zinc-700/50 rounded-lg space-y-2">
                        <div className="flex gap-2">
                            <Input placeholder="欄位標題" value={col.title || ''} onChange={(e) => updateColumn(index, 'title', e.target.value)} />
                            <button type="button" onClick={() => removeColumn(index)} className="p-1 text-zinc-500 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <textarea
                            className="w-full px-3 py-2 bg-zinc-600 border border-zinc-500 rounded-lg text-white text-sm"
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
                    className="w-full py-2 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                >
                    + 新增欄位
                </button>
            </div>
        </div>
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
                    <label className="block text-sm text-zinc-400 mb-1">欄數</label>
                    <select
                        value={props.columns || 3}
                        onChange={(e) => onChange({ columns: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                    >
                        <option value="2">2 欄</option>
                        <option value="3">3 欄</option>
                        <option value="4">4 欄</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">間距 (px)</label>
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
                <label className="block text-sm text-zinc-400">圖片列表</label>
                {images.map((img: any, index: number) => (
                    <div key={index} className="p-3 bg-zinc-700/50 rounded-lg space-y-2">
                        <Input placeholder="圖片 URL" value={img.url || ''} onChange={(e) => updateImage(index, 'url', e.target.value)} />

                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input placeholder="圖片說明" value={img.alt || ''} onChange={(e) => updateImage(index, 'alt', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeImage(index)} className="p-2 text-zinc-500 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <Input placeholder="連結 (可選)" value={img.link || ''} onChange={(e) => updateImage(index, 'link', e.target.value)} />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addImage}
                    className="w-full py-2 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                >
                    + 新增圖片
                </button>
            </div>
        </div>
    )
}

// 5. 商品列表編輯器 - 完整實作
export function ProductListEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const selectedIds = props.productIds || []

    const toggleProduct = (id: string) => {
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter((pid: string) => pid !== id)
            : [...selectedIds, id]
        onChange({ productIds: newIds })
    }

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-zinc-400 mb-1">區塊標題</label>
                <Input placeholder="精選商品" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">佈局</label>
                    <select
                        value={props.layout || 'grid'}
                        onChange={(e) => onChange({ layout: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                    >
                        <option value="grid">網格</option>
                        <option value="list">列表</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">欄數</label>
                    <Input type="number" min="1" max="4" value={props.columns || 3} onChange={(e) => onChange({ columns: parseInt(e.target.value) || 3 })} />
                </div>
            </div>

            <div>
                <label className="block text-sm text-zinc-400 mb-2">選擇商品 (ID列表)</label>
                <textarea
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm font-mono"
                    rows={4}
                    placeholder="輸入商品ID，每行一個&#10;例如：&#10;uuid-1234&#10;uuid-5678"
                    value={(props.productIds || []).join('\n')}
                    onChange={(e) => {
                        const ids = e.target.value.split('\n').filter(id => id.trim())
                        onChange({ productIds: ids })
                    }}
                />
                <p className="text-xs text-zinc-500 mt-1">💡 提示：在商品管理頁面複製商品 ID</p>
            </div>
        </div>
    )
}

// 6. 商品分類編輯器 - 完整實作
export function ProductCategoryEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-zinc-400 mb-1">區塊標題</label>
                <Input placeholder="商品分類" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm text-zinc-400 mb-1">分類名稱</label>
                <Input placeholder="請輸入分類" value={props.category || ''} onChange={(e) => onChange({ category: e.target.value })} />
                <p className="text-xs text-zinc-500 mt-1">💡 輸入商品的分類名稱（需與商品管理中的分類一致）</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">顯示數量</label>
                    <Input type="number" min="1" max="50" value={props.limit || 8} onChange={(e) => onChange({ limit: parseInt(e.target.value) || 8 })} />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">佈局</label>
                    <select
                        value={props.layout || 'grid'}
                        onChange={(e) => onChange({ layout: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                    >
                        <option value="grid">網格</option>
                        <option value="list">列表</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm text-zinc-400 mb-1">網格欄數</label>
                <Input type="number" min="2" max="4" value={props.columns || 3} onChange={(e) => onChange({ columns: parseInt(e.target.value) || 3 })} />
            </div>
        </div>
    )
}

// 7. 商品輪播編輯器 - 完整實作
export function ProductCarouselEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-zinc-400 mb-1">區塊標題</label>
                <Input placeholder="熱門商品" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                    <input
                        type="checkbox"
                        checked={props.autoplay ?? true}
                        onChange={(e) => onChange({ autoplay: e.target.checked })}
                        className="bg-zinc-700 border-zinc-600"
                    />
                    自動輪播
                </label>
            </div>

            <div>
                <label className="block text-sm text-zinc-400 mb-2">選擇商品 (ID列表)</label>
                <textarea
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm font-mono"
                    rows={4}
                    placeholder="輸入商品ID，每行一個&#10;例如：&#10;uuid-1234&#10;uuid-5678"
                    value={(props.productIds || []).join('\n')}
                    onChange={(e) => {
                        const ids = e.target.value.split('\n').filter(id => id.trim())
                        onChange({ productIds: ids })
                    }}
                />
                <p className="text-xs text-zinc-500 mt-1">💡 提示：在商品管理頁面複製商品 ID</p>
            </div>

            <div>
                <label className="block text-sm text-zinc-400 mb-1">輪播速度 (秒)</label>
                <Input type="number" min="1" max="60" value={props.interval || 5} onChange={(e) => onChange({ interval: parseInt(e.target.value) || 5 })} />
            </div>
        </div>
    )
}
