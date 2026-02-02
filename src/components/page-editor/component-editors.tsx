// 新元件編輯器
import { Input } from '@/components/ui/input'
import { Trash2, Plus } from 'lucide-react'

// 1. 輪播圖編輯器
export function CarouselEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const images = props.images || []

    const addImage = () => {
        onChange({ images: [...images, { url: '', alt: '\u5716\u7247', link: '' }] })
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
                        \u81ea\u52d5\u8f2a\u64ad
                    </label>
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">\u9593\u9694(\u79d2)</label>
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
                <label className="block text-sm text-zinc-400">\u5716\u7247\u5217\u8868</label>
                {images.map((img: any, index: number) => (
                    <div key={index} className="p-3 bg-zinc-700/50 rounded-lg space-y-2">
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input placeholder="\u5716\u7247\u7db2\u5740" value={img.url || ''} onChange={(e) => updateImage(index, 'url', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeImage(index)} className="p-1 text-zinc-500 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="\u5716\u7247\u8aaa\u660e" value={img.alt || ''} onChange={(e) => updateImage(index, 'alt', e.target.value)} />
                            <Input placeholder="\u9023\u7d50 (\u53ef\u9078)" value={img.link || ''} onChange={(e) => updateImage(index, 'link', e.target.value)} />
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addImage}
                    className="w-full py-2 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                >
                    + \u65b0\u589e\u5716\u7247
                </button>
            </div>
        </div>
    )
}

// 2. \u5716\u6587\u7d44\u5408\u7de8\u8f2f\u5668
export function ImageTextEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-zinc-400 mb-1">\u6392\u7248</label>
                <select
                    value={props.layout || 'left'}
                    onChange={(e) => onChange({ layout: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                >
                    <option value="left">\u5716\u7247\u5728\u5de6</option>
                    <option value="right">\u5716\u7247\u5728\u53f3</option>
                </select>
            </div>
            <div>
                <label className="block text-sm text-zinc-400 mb-1">\u5716\u7247\u7db2\u5740</label>
                <Input placeholder="https://..." value={props.imageUrl || ''} onChange={(e) => onChange({ imageUrl: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm text-zinc-400 mb-1">\u6a19\u984c</label>
                <Input placeholder="\u6a19\u984c" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm text-zinc-400 mb-1">\u5167\u5bb9</label>
                <textarea
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder:text-zinc-400"
                    rows={4}
                    placeholder="\u6587\u5b57\u8aaa\u660e..."
                    value={props.content || ''}
                    onChange={(e) => onChange({ content: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">\u6309\u9215\u6587\u5b57</label>
                    <Input placeholder="\u4e86\u89e3\u66f4\u591a" value={props.buttonText || ''} onChange={(e) => onChange({ buttonText: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">\u6309\u9215\u9023\u7d50</label>
                    <Input placeholder="https://..." value={props.buttonUrl || ''} onChange={(e) => onChange({ buttonUrl: e.target.value })} />
                </div>
            </div>
        </div>
    )
}

// 3. \u6587\u5b57\u7d44\u5408\u7de8\u8f2f\u5668
export function TextColumnsEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const columns = props.columns || []

    const addColumn = () => {
        onChange({ columns: [...columns, { title: '\u6b04\u4f4d', content: '\u5167\u5bb9' }] })
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
                <label className="block text-sm text-zinc-400 mb-1">\u6b04\u6578</label>
                <select
                    value={props.columnCount || 3}
                    onChange={(e) => onChange({ columnCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                >
                    <option value="2">2 \u6b04</option>
                    <option value="3">3 \u6b04</option>
                    <option value="4">4 \u6b04</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-zinc-400">\u6b04\u4f4d\u5167\u5bb9</label>
                {columns.map((col: any, index: number) => (
                    <div key={index} className="p-3 bg-zinc-700/50 rounded-lg space-y-2">
                        <div className="flex gap-2">
                            <Input placeholder="\u6b04\u4f4d\u6a19\u984c" value={col.title || ''} onChange={(e) => updateColumn(index, 'title', e.target.value)} />
                            <button type="button" onClick={() => removeColumn(index)} className="p-1 text-zinc-500 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <textarea
                            className="w-full px-3 py-2 bg-zinc-600 border border-zinc-500 rounded-lg text-white text-sm"
                            rows={2}
                            placeholder="\u6b04\u4f4d\u5167\u5bb9"
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
                    + \u65b0\u589e\u6b04\u4f4d
                </button>
            </div>
        </div>
    )
}

// 4. \u5716\u7247\u7d44\u5408\u7de8\u8f2f\u5668
export function ImageGridEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const images = props.images || []

    const addImage = () => {
        onChange({ images: [...images, { url: '', alt: '\u5716\u7247', link: '' }] })
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
                    <label className="block text-sm text-zinc-400 mb-1">\u6b04\u6578</label>
                    <select
                        value={props.columns || 3}
                        onChange={(e) => onChange({ columns: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                    >
                        <option value="2">2 \u6b04</option>
                        <option value="3">3 \u6b04</option>
                        <option value="4">4 \u6b04</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">\u9593\u8ddd (px)</label>
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
                <label className="block text-sm text-zinc-400">\u5716\u7247\u5217\u8868</label>
                {images.map((img: any, index: number) => (
                    <div key={index} className="p-3 bg-zinc-700/50 rounded-lg space-y-2">
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input placeholder="\u5716\u7247\u7db2\u5740" value={img.url || ''} onChange={(e) => updateImage(index, 'url', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeImage(index)} className="p-1 text-zinc-500 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="\u5716\u7247\u8aaa\u660e" value={img.alt || ''} onChange={(e) => updateImage(index, 'alt', e.target.value)} />
                            <Input placeholder="\u9023\u7d50 (\u53ef\u9078)" value={img.link || ''} onChange={(e) => updateImage(index, 'link', e.target.value)} />
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addImage}
                    className="w-full py-2 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                >
                    + \u65b0\u589e\u5716\u7247
                </button>
            </div>
        </div>
    )
}

// 5-7. \u5546\u54c1\u76f8\u95dc\u7de8\u8f2f\u5668
export function ProductListEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-zinc-400 mb-1">\u5340\u584a\u6a19\u984c</label>
                <Input placeholder="\u7cbe\u9078\u5546\u54c1" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">\u4f48\u5c40</label>
                    <select
                        value={props.layout || 'grid'}
                        onChange={(e) => onChange({ layout: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                    >
                        <option value="grid">\u7db2\u683c</option>
                        <option value="list">\u5217\u8868</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">\u6b04\u6578</label>
                    <Input type="number" min="1" max="4" value={props.columns || 3} onChange={(e) => onChange({ columns: parseInt(e.target.value) || 3 })} />
                </div>
            </div>
            <div className="text-xs text-zinc-500">\u2139\ufe0f \u529f\u80fd\u958b\u767c\u4e2d\uff1a\u5f9e\u5546\u54c1\u5217\u8868\u4e2d\u9078\u64c7</div>
        </div>
    )
}

export function ProductCategoryEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-zinc-400 mb-1">\u5340\u584a\u6a19\u984c</label>
                <Input placeholder="\u5546\u54c1\u5206\u985e" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div>
                <label className="block text-sm text-zinc-400 mb-1">\u5206\u985e\u540d\u7a31</label>
                <Input placeholder="\u8acb\u8f38\u5165\u5206\u985e" value={props.category || ''} onChange={(e) => onChange({ category: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">\u986f\u793a\u6578\u91cf</label>
                    <Input type="number" min="1" max="50" value={props.limit || 8} onChange={(e) => onChange({ limit: parseInt(e.target.value) || 8 })} />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">\u4f48\u5c40</label>
                    <select
                        value={props.layout || 'grid'}
                        onChange={(e) => onChange({ layout: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                    >
                        <option value="grid">\u7db2\u683c</option>
                        <option value="list">\u5217\u8868</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export function ProductCarouselEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm text-zinc-400 mb-1">\u5340\u584a\u6a19\u984c</label>
                <Input placeholder="\u71b1\u9580\u5546\u54c1" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div>
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                    <input
                        type="checkbox"
                        checked={props.autoplay ?? true}
                        onChange={(e) => onChange({ autoplay: e.target.checked })}
                        className="bg-zinc-700 border-zinc-600"
                    />
                    \u81ea\u52d5\u8f2a\u64ad
                </label>
            </div>
            <div className="text-xs text-zinc-500">\u2139\ufe0f \u529f\u80fd\u958b\u767c\u4e2d\uff1a\u5f9e\u5546\u54c1\u5217\u8868\u4e2d\u9078\u64c7</div>
        </div>
    )
}
