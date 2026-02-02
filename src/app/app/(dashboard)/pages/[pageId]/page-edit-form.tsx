'use client'

import { useActionState, useState, useEffect } from 'react'
import { ArrowLeft, Loader2, Trash2, GripVertical, Type, Image, LayoutGrid, MessageSquare, Eye, ChevronUp, ChevronDown, X, ExternalLink, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    CarouselEditor,
    ImageTextEditor,
    TextColumnsEditor,
    ImageGridEditor,
    ProductListEditor,
    ProductCategoryEditor,
    ProductCarouselEditor
} from '@/components/page-editor/component-editors'
import { updatePageContent } from '../actions'

interface PageComponent {
    id: string
    type: string
    props: Record<string, any>
}

interface Props {
    page: {
        id: string
        title: string
        slug: string
        is_homepage: boolean
        published: boolean
        content: PageComponent[]
    }
    updateAction: (prevState: any, formData: FormData) => Promise<{ error?: string }>
    storeSlug?: string
}

// 元件分類定義
const componentCategories = [
    {
        name: '圖片元件',
        components: [
            { type: 'hero', icon: Image, label: 'Hero Banner', description: '大型橫幅圖片' },
            { type: 'carousel', icon: Image, label: '輪播圖', description: '圖片輪播' },
            { type: 'image_text', icon: LayoutGrid, label: '圖文組合', description: '圖片+文字' },
            { type: 'image_grid', icon: LayoutGrid, label: '圖片組合', description: '多圖網格' },
        ]
    },
    {
        name: '文字元件',
        components: [
            { type: 'text', icon: Type, label: '文字區塊', description: '純文字內容' },
            { type: 'text_columns', icon: LayoutGrid, label: '文字組合', description: '多欄文字' },
            { type: 'features', icon: LayoutGrid, label: '特色區塊', description: '特色/服務' },
            { type: 'faq', icon: MessageSquare, label: 'FAQ 問答', description: '常見問答' },
        ]
    },
    {
        name: '商品元件',
        components: [
            { type: 'product_list', icon: LayoutGrid, label: '商品列表', description: '精選商品' },
            { type: 'product_category', icon: LayoutGrid, label: '商品分類', description: '分類商品' },
            { type: 'product_carousel', icon: LayoutGrid, label: '商品輪播', description: '商品輪播' },
        ]
    },
]

// 平鋪所有元件（用於查找）
const allComponentTypes = componentCategories.flatMap(cat => cat.components)


export function PageEditForm({ page, updateAction, storeSlug }: Props) {
    const [state, formAction, pending] = useActionState(updateAction, { error: '' })
    const [components, setComponents] = useState<PageComponent[]>(page.content || [])
    const [saving, setSaving] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

    // 彈窗開啟時鎖定 body 滾動
    useEffect(() => {
        if (showAddModal) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [showAddModal])

    const addComponent = (type: string) => {
        const newComponent: PageComponent = {
            id: crypto.randomUUID(),
            type,
            props: getDefaultProps(type),
        }
        setComponents([...components, newComponent])
        setShowAddModal(false)
    }

    const removeComponent = (id: string) => {
        setComponents(components.filter(c => c.id !== id))
    }

    const updateComponent = (id: string, props: Record<string, any>) => {
        setComponents(components.map(c =>
            c.id === id ? { ...c, props: { ...c.props, ...props } } : c
        ))
    }

    const moveComponent = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= components.length) return
        const newComponents = [...components]
        const [moved] = newComponents.splice(fromIndex, 1)
        newComponents.splice(toIndex, 0, moved)
        setComponents(newComponents)
    }

    const handleDragStart = (index: number) => {
        setDragIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (dragIndex !== null && dragIndex !== index) {
            moveComponent(dragIndex, index)
            setDragIndex(index)
        }
    }

    const handleDragEnd = () => {
        setDragIndex(null)
    }

    const saveContent = async () => {
        setSaving(true)
        await updatePageContent(page.id, components)
        setSaving(false)
    }

    return (
        <div className="h-screen flex flex-col">
            {/* 頂部標題列 */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <Link href="/app/pages" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">{page.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {storeSlug && page.published && (
                        <Link
                            href={`/store/${storeSlug}/${page.slug}`}
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                        >
                            <ExternalLink className="h-4 w-4" />
                            查看頁面
                        </Link>
                    )}
                    <Button onClick={saveContent} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        儲存內容
                    </Button>
                </div>
            </div>

            {state.error && (
                <div className="mx-6 mt-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
                    {state.error}
                </div>
            )}

            {/* 主內容區 - 左右分割 */}
            <div className="flex-1 flex overflow-hidden">
                {/* 左側 - 元件列表編輯 */}
                <div className="w-96 bg-zinc-900 border-r border-zinc-800 flex flex-col">
                    {/* 頁面設定 */}
                    <div className="p-4 border-b border-zinc-800">
                        <form action={formAction} className="space-y-3">
                            <h2 className="text-sm font-semibold text-white mb-3">頁面設定</h2>
                            <div>
                                <Label htmlFor="title" className="text-xs text-zinc-400">頁面標題</Label>
                                <Input id="title" name="title" required defaultValue={page.title} className="h-8 text-sm" />
                            </div>
                            <div>
                                <Label htmlFor="slug" className="text-xs text-zinc-400">頁面網址</Label>
                                <Input id="slug" name="slug" required defaultValue={page.slug} className="h-8 text-sm" />
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                                    <input type="checkbox" name="is_homepage" defaultChecked={page.is_homepage} className="rounded bg-zinc-800 border-zinc-600" />
                                    設為首頁
                                </label>
                                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                                    <input type="checkbox" name="published" defaultChecked={page.published} className="rounded bg-zinc-800 border-zinc-600" />
                                    發布
                                </label>
                            </div>
                            <Button type="submit" variant="outline" size="sm" className="w-full" disabled={pending}>
                                {pending && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                                更新設定
                            </Button>
                        </form>
                    </div>

                    {/* 元件列表 */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-semibold text-white">頁面元件</h2>
                                <Button onClick={() => setShowAddModal(true)} size="sm" className="h-7 text-xs">
                                    <Plus className="h-3 w-3 mr-1" />
                                    新增
                                </Button>
                            </div>

                            {components.length === 0 ? (
                                <div className="text-center py-12 text-zinc-500 text-sm">
                                    點擊上方按鈕新增元件
                                </div>
                            ) : (
                                components.map((component, index) => (
                                    <div
                                        key={component.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setSelectedComponentId(component.id)}
                                        className={`bg-zinc-800 rounded-lg border-2 transition-all cursor-pointer ${selectedComponentId === component.id
                                            ? 'border-rose-500'
                                            : 'border-transparent hover:border-zinc-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between p-3 border-b border-zinc-700">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-4 w-4 text-zinc-500 cursor-grab" />
                                                <span className="font-medium text-sm text-white">{getComponentLabel(component.type)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); moveComponent(index, index - 1) }}
                                                    disabled={index === 0}
                                                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); moveComponent(index, index + 1) }}
                                                    disabled={index === components.length - 1}
                                                    className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeComponent(component.id) }}
                                                    className="p-1 text-zinc-500 hover:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        {selectedComponentId === component.id && (
                                            <div className="p-3">
                                                <ComponentEditor
                                                    type={component.type}
                                                    props={component.props}
                                                    onChange={(props) => updateComponent(component.id, props)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>


                {/* 右側 - 預覽 */}
                <div className="flex-1 bg-white overflow-y-auto">
                    <div className="sticky top-0 bg-zinc-100 px-4 py-2 border-b z-10 flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-700">預覽</span>
                        <div className="flex items-center gap-1 bg-zinc-200 rounded-lg p-1">
                            <button
                                onClick={() => setPreviewMode('desktop')}
                                className={`px-3 py-1 text-xs rounded transition-colors ${previewMode === 'desktop'
                                    ? 'bg-white text-zinc-900 shadow-sm'
                                    : 'text-zinc-600 hover:text-zinc-900'
                                    }`}
                                title="桌面版"
                            >
                                💻 桌面
                            </button>
                            <button
                                onClick={() => setPreviewMode('mobile')}
                                className={`px-3 py-1 text-xs rounded transition-colors ${previewMode === 'mobile'
                                    ? 'bg-white text-zinc-900 shadow-sm'
                                    : 'text-zinc-600 hover:text-zinc-900'
                                    }`}
                                title="手機版"
                            >
                                📱 手機
                            </button>
                        </div>
                    </div>
                    <div className="p-6 flex justify-center">
                        <div className={`transition-all ${previewMode === 'mobile' ? 'max-w-[375px] w-full' : 'w-full'
                            }`}>
                            {components.length === 0 ? (
                                <div className="text-center py-20 text-zinc-400">
                                    尚無內容
                                </div>
                            ) : (
                                components.map((component) => (
                                    <ComponentPreview key={component.id} type={component.type} props={component.props} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 新增元件彈窗 - 兩欄分類顯示 */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                            <h3 className="text-xl font-bold text-white">選擇元件類型</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-zinc-400 hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="space-y-8">
                                {componentCategories.map((category) => (
                                    <div key={category.name}>
                                        <h4 className="text-sm font-semibold text-zinc-400 mb-3">{category.name}</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {category.components.map((ct) => (
                                                <button
                                                    key={ct.type}
                                                    onClick={() => addComponent(ct.type)}
                                                    className="flex items-start gap-3 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors group"
                                                >
                                                    <div className="p-2 bg-zinc-700 group-hover:bg-zinc-600 rounded-lg transition-colors">
                                                        <ct.icon className="h-5 w-5 text-zinc-300" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-white mb-1">{ct.label}</div>
                                                        <div className="text-xs text-zinc-400">{ct.description}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function getComponentLabel(type: string): string {
    const component = allComponentTypes.find(ct => ct.type === type)
    return component?.label || type
}

function getDefaultProps(type: string): Record<string, any> {
    switch (type) {
        case 'hero':
            return { title: '歡迎', subtitle: '這是副標題', backgroundUrl: '', buttonText: '了解更多', buttonUrl: '' }
        case 'carousel':
            return { images: [{ url: '', alt: '圖片 1', link: '' }], autoplay: true, interval: 5 }
        case 'image_text':
            return { layout: 'left', imageUrl: '', title: '標題', content: '內容說明', buttonText: '', buttonUrl: '' }
        case 'image_grid':
            return { images: [{ url: '', alt: '圖片', link: '' }], columns: 3, gap: 16 }
        case 'text':
            return { content: '請輸入內容...' }
        case 'text_columns':
            return { columns: [{ title: '欄位一', content: '內容' }], columnCount: 3 }
        case 'features':
            return { title: '我們的特色', items: [{ icon: '⭐', title: '特色一', description: '說明' }] }
        case 'faq':
            return { title: '常見問題', items: [{ question: '問題？', answer: '答案' }] }
        case 'product_list':
            return { title: '精選商品', productIds: [], layout: 'grid', columns: 3 }
        case 'product_category':
            return { title: '商品分類', category: '', limit: 8, layout: 'grid' }
        case 'product_carousel':
            return { title: '熱門商品', productIds: [], autoplay: true }
        default:
            return {}
    }
}

function ComponentEditor({ type, props, onChange }: { type: string; props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    switch (type) {
        case 'hero':
            return (
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">標題</label>
                        <Input placeholder="標題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">副標題</label>
                        <Input placeholder="副標題" value={props.subtitle || ''} onChange={(e) => onChange({ subtitle: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">背景圖片網址</label>
                        <Input placeholder="https://..." value={props.backgroundUrl || ''} onChange={(e) => onChange({ backgroundUrl: e.target.value })} />
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
        case 'carousel':
            return <CarouselEditor props={props} onChange={onChange} />
        case 'image_text':
            return <ImageTextEditor props={props} onChange={onChange} />
        case 'image_grid':
            return <ImageGridEditor props={props} onChange={onChange} />
        case 'text':
            return (
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">內容</label>
                    <textarea
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder:text-zinc-400"
                        rows={4}
                        placeholder="輸入內容..."
                        value={props.content || ''}
                        onChange={(e) => onChange({ content: e.target.value })}
                    />
                </div>
            )
        case 'text_columns':
            return <TextColumnsEditor props={props} onChange={onChange} />
        case 'features':
            return <FeaturesEditor props={props} onChange={onChange} />
        case 'faq':
            return <FAQEditor props={props} onChange={onChange} />
        case 'product_list':
            return <ProductListEditor props={props} onChange={onChange} />
        case 'product_category':
            return <ProductCategoryEditor props={props} onChange={onChange} />
        case 'product_carousel':
            return <ProductCarouselEditor props={props} onChange={onChange} />
        default:
            return (
                <div className="text-zinc-500 text-sm">
                    此元件類型的編輯器開發中
                </div>
            )
    }
}

// Features 編輯器
function FeaturesEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const items = props.items || []

    const addItem = () => {
        onChange({ items: [...items, { icon: '⭐', title: '新特色', description: '說明' }] })
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
                <label className="block text-sm text-zinc-400 mb-1">區塊標題</label>
                <Input placeholder="標題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-zinc-400">特色項目</label>
                {items.map((item: any, index: number) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-zinc-700/50 rounded-lg">
                        <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="圖標 (emoji)" value={item.icon || ''} onChange={(e) => updateItem(index, 'icon', e.target.value)} />
                                <Input placeholder="標題" value={item.title || ''} onChange={(e) => updateItem(index, 'title', e.target.value)} />
                            </div>
                            <Input placeholder="說明" value={item.description || ''} onChange={(e) => updateItem(index, 'description', e.target.value)} />
                        </div>
                        <button type="button" onClick={() => removeItem(index)} className="p-1 text-zinc-500 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addItem}
                    className="w-full py-2 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                >
                    + 新增特色
                </button>
            </div>
        </div>
    )
}

// FAQ 編輯器
function FAQEditor({ props, onChange }: { props: Record<string, any>; onChange: (props: Record<string, any>) => void }) {
    const items = props.items || []

    const addItem = () => {
        onChange({ items: [...items, { question: '新問題？', answer: '請輸入答案' }] })
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
                <label className="block text-sm text-zinc-400 mb-1">區塊標題</label>
                <Input placeholder="常見問題" value={props.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
            </div>
            <div className="space-y-2">
                <label className="block text-sm text-zinc-400">問答項目</label>
                {items.map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-zinc-700/50 rounded-lg space-y-2">
                        <div className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input placeholder="問題" value={item.question || ''} onChange={(e) => updateItem(index, 'question', e.target.value)} />
                            </div>
                            <button type="button" onClick={() => removeItem(index)} className="p-1 text-zinc-500 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <textarea
                            className="w-full px-3 py-2 bg-zinc-600 border border-zinc-500 rounded-lg text-white placeholder:text-zinc-400 text-sm"
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
                    className="w-full py-2 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                >
                    + 新增問答
                </button>
            </div>
        </div>
    )
}

function ComponentPreview({ type, props }: { type: string; props: Record<string, any> }) {
    switch (type) {
        case 'hero':
            return (
                <div
                    className="relative py-20 px-8 mb-4 rounded-lg overflow-hidden"
                    style={{
                        backgroundImage: props.backgroundUrl ? `url(${props.backgroundUrl})` : undefined,
                        backgroundColor: props.backgroundUrl ? undefined : '#1f2937',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2">{props.title || '標題'}</h1>
                        <p className="text-lg text-gray-300">{props.subtitle || '副標題'}</p>
                        {props.buttonText && (
                            <button className="mt-4 px-6 py-2 bg-white text-gray-900 rounded-lg font-medium">
                                {props.buttonText}
                            </button>
                        )}
                    </div>
                </div>
            )
        case 'text':
            return (
                <div className="py-6 px-4 mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{props.content || '內容'}</p>
                </div>
            )
        case 'features':
            return (
                <div className="py-8 px-4 mb-4 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-bold text-gray-800 text-center mb-6">{props.title || '特色'}</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {(props.items || []).map((item: any, i: number) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl mb-2">{item.icon}</div>
                                <h3 className="font-medium text-gray-800">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        case 'faq':
            return (
                <div className="py-8 px-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{props.title || 'FAQ'}</h2>
                    <div className="space-y-3">
                        {(props.items || []).map((item: any, i: number) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-medium text-gray-800">{item.question}</h3>
                                <p className="text-gray-600 mt-2 text-sm">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        default:
            return <div className="py-4 text-gray-400">未知元件</div>
    }
}
