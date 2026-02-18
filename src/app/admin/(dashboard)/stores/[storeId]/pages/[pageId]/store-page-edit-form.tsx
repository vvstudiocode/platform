'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { ArrowLeft, Loader2, Trash2, GripVertical, Type, Image, LayoutGrid, MessageSquare, Eye, ChevronUp, ChevronDown, ChevronRight, X, ExternalLink, Plus, Save, MessageSquareQuote, Sparkles, RotateCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    CarouselEditor,
    HeroEditor,
    ImageTextEditor,
    TextColumnsEditor,
    TextEditor,
    ImageGridEditor,
    ProductListEditor,
    ProductCategoryEditor,
    ProductCarouselEditor,
    MarqueeEditor,
    ImageMarqueeEditor,
    ImageTestimonialsEditor,
    FlowingMenuBlockEditor,
    ImageTrailEditor,
    ShinyTextEditor,
    GradientTextEditor,
    RotatingTextEditor,
    PricingSection2Editor
} from '@/components/page-editor/component-editors'
import { SpacingControls, ImageControls, AspectRatioControls } from '@/components/page-editor/responsive-controls'
import { PageContentRenderer } from '@/components/store/page-content-renderer'
import { updateStorePageContent } from '../actions'

interface PageComponent {
    id: string
    type: string
    props: Record<string, any>
}

interface Props {
    storeId: string
    storeName: string
    storeSlug: string
    page: {
        id: string
        title: string
        slug: string
        is_homepage: boolean
        published: boolean
        content: PageComponent[]
        seo_title?: string
        seo_description?: string
        seo_keywords?: string
        background_color?: string
    }
    updateAction: (prevState: any, formData: FormData) => Promise<{ error?: string }>
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
            { type: 'image_testimonials', icon: MessageSquareQuote, label: '動態見證牆', description: '客戶好評與見證' },
        ]
    },
    {
        name: '文字元件',
        components: [
            { type: 'text', icon: Type, label: '文字區塊', description: '純文字內容' },
            { type: 'text_columns', icon: LayoutGrid, label: '文字組合', description: '多欄文字' },
            { type: 'features', icon: LayoutGrid, label: '特色區塊', description: '特色/服務' },
            { type: 'faq', icon: MessageSquare, label: 'FAQ 問答', description: '常見問答' },
            { type: 'shiny_text', icon: Sparkles, label: '閃亮文字', description: '金屬光澤文字效果' },
            { type: 'gradient_text', icon: Sparkles, label: '漸變文字', description: '漸層色彩文字效果' },
            { type: 'rotating_text', icon: RotateCw, label: '輪替文字', description: '輪替文字效果' },
            { type: 'pricing_2', icon: LayoutGrid, label: '價格方案2', description: '月/年切換價格表' },
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
    {
        name: '互動元件',
        components: [
            { type: 'marquee', icon: Type, label: '跑馬燈', description: '滾動文字公告' },
            { type: 'image_marquee', icon: Image, label: '圖片跑馬燈', description: '滾動圖片展示' },
            { type: 'flowing-menu-block', icon: LayoutGrid, label: '流動選單', description: 'GSAP 流動選單效果' },
            { type: 'image-trail-block', icon: Sparkles, label: '圖片軌跡', description: '滑鼠軌跡圖片效果' },
        ]
    },
]

// 平鋪所有元件（用於查找）
const allComponentTypes = componentCategories.flatMap(cat => cat.components)

export function StorePageEditForm({ storeId, storeName, storeSlug, page, updateAction }: Props) {
    // State for settings
    const [title, setTitle] = useState(page.title)
    const [slug, setSlug] = useState(page.slug)
    const [seoTitle, setSeoTitle] = useState(page.seo_title || '')
    const [seoDescription, setSeoDescription] = useState(page.seo_description || '')
    const [seoKeywords, setSeoKeywords] = useState(page.seo_keywords || '')
    const [backgroundColor, setBackgroundColor] = useState(page.background_color || '#ffffff')
    const [isHomepage, setIsHomepage] = useState(page.is_homepage)
    const [published, setPublished] = useState(page.published)

    const [error, setError] = useState('')

    // Ensure all components have an ID on load
    const [components, setComponents] = useState<PageComponent[]>(() => {
        return (page.content || []).map(c => ({
            ...c,
            id: c.id || crypto.randomUUID()
        }))
    })
    const [saving, setSaving] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
    const [showMobilePreview, setShowMobilePreview] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [settingsCollapsed, setSettingsCollapsed] = useState(true)  // 頁面設定預設收合
    const componentListRef = useRef<HTMLDivElement>(null)

    // 滾動到選中的元件
    const scrollToComponent = (componentId: string) => {
        const element = document.getElementById(`component-${componentId}`)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    // 切換元件展開/收合
    const toggleComponent = (componentId: string) => {
        if (selectedComponentId === componentId) {
            setSelectedComponentId(null)
        } else {
            setSelectedComponentId(componentId)
            // 延遲滾動以確保展開動畫開始/DOM已更新
            // Use requestAnimationFrame for better timing
            requestAnimationFrame(() => {
                setTimeout(() => {
                    // 1. 滾動編輯器列表
                    const editorElement = document.getElementById(`component-${componentId}`)
                    if (editorElement) {
                        editorElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        })
                    }

                    // 2. 滾動預覽畫面
                    const previewElement = document.getElementById(`preview-${componentId}`)
                    if (previewElement) {
                        previewElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        })
                    }
                }, 100)
            })
        }
    }

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
        setError('')
        try {
            // 1. Save Settings
            const formData = new FormData()
            formData.append('title', title)
            formData.append('slug', slug)
            formData.append('background_color', backgroundColor)
            formData.append('seo_title', seoTitle)
            formData.append('seo_description', seoDescription)
            formData.append('seo_keywords', seoKeywords)
            if (isHomepage) formData.append('is_homepage', 'on')
            if (published) formData.append('published', 'on')

            // Call updateAction manually
            const settingsResult = await updateAction(null, formData)
            if (settingsResult?.error) {
                throw new Error(settingsResult.error)
            }

            // 2. Save Content
            const contentResult = await updateStorePageContent(storeId, page.id, components)
            if (contentResult?.error) {
                throw new Error(contentResult.error)
            }

            if (!settingsResult?.error && !contentResult?.error) {
                setIsSaved(true)
                setTimeout(() => { setIsSaved(false) }, 2000)
            }
        } catch (error: any) {
            console.error('Save failed:', error)
            setError(error.message || '儲存失敗，請稍後再試')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="h-screen flex flex-col">
            {/* 頂部標題列 */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/stores/${storeId}/pages`} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="text-xs text-zinc-500 mb-0.5">{storeName}</div>
                        <h1 className="text-xl font-bold text-white max-w-[200px] truncate">{title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* 手機版預覽按鈕 */}
                    <button
                        onClick={() => setShowMobilePreview(true)}
                        className="md:hidden flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                    >
                        <Eye className="h-4 w-4" />
                        預覽
                    </button>
                    {storeSlug && published && (
                        <Link
                            href={isHomepage ? `/store/${storeSlug}` : `/store/${storeSlug}/${slug}`}
                            target="_blank"
                            className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                        >
                            <ExternalLink className="h-4 w-4" />
                            查看頁面
                        </Link>
                    )}
                    <Button onClick={saveContent} disabled={saving || isSaved} className="min-w-[110px]">
                        {saving ? '儲存中...' : isSaved ? '已儲存' : '儲存內容'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mx-6 mt-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4">
                    {error}
                </div>
            )}

            {/* 主內容區 - 左右分割 */}
            <div className="flex-1 flex overflow-hidden">
                {/* 左側 - 元件列表編輯 */}
                <div className="w-full md:w-96 bg-zinc-900 md:border-r border-zinc-800 flex flex-col">
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {/* 頁面設定 - 可收合 */}
                        <div className="border-b border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setSettingsCollapsed(!settingsCollapsed)}
                                className="w-full flex items-center justify-between p-4 text-sm font-semibold text-white hover:bg-zinc-800/50 transition-colors"
                            >
                                <span>頁面設定</span>
                                <ChevronRight className={`h-4 w-4 transition-transform ${settingsCollapsed ? '' : 'rotate-90'}`} />
                            </button>
                            {!settingsCollapsed && (
                                <div className="px-4 pb-4">
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="title" className="text-xs text-zinc-400">頁面標題</Label>
                                            <Input
                                                id="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="h-8 text-sm bg-zinc-800 border-zinc-700 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="slug" className="text-xs text-zinc-400">頁面網址</Label>
                                            <Input
                                                id="slug"
                                                value={isHomepage ? '' : slug}
                                                onChange={(e) => setSlug(e.target.value)}
                                                disabled={isHomepage}
                                                className="h-8 text-sm bg-zinc-800 border-zinc-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder={isHomepage ? "首頁不需設定網址" : ""}
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs text-zinc-400">背景顏色</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Input
                                                    value={backgroundColor}
                                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                                    className="h-8 text-sm flex-1 bg-zinc-800 border-zinc-700 text-white"
                                                    placeholder="#ffffff"
                                                />
                                                <input
                                                    type="color"
                                                    value={backgroundColor}
                                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border border-zinc-600"
                                                />
                                            </div>
                                        </div>

                                        {/* SEO Settings */}
                                        <div className="pt-2 border-t border-zinc-800">
                                            <h3 className="text-xs font-semibold text-zinc-400 mb-2">SEO 設定</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <Label htmlFor="seo_title" className="text-xs text-zinc-500">SEO 標題 (Title)</Label>
                                                    <Input
                                                        id="seo_title"
                                                        value={seoTitle}
                                                        onChange={(e) => setSeoTitle(e.target.value)}
                                                        className="h-8 text-sm bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                                        placeholder="預設使用頁面標題"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="seo_description" className="text-xs text-zinc-500">SEO 描述 (Description)</Label>
                                                    <textarea
                                                        id="seo_description"
                                                        value={seoDescription}
                                                        onChange={(e) => setSeoDescription(e.target.value)}
                                                        className="w-full flex min-h-[60px] rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        placeholder="簡短描述此頁面內容..."
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="seo_keywords" className="text-xs text-zinc-500">SEO 關鍵字 (Keywords)</Label>
                                                    <Input
                                                        id="seo_keywords"
                                                        value={seoKeywords}
                                                        onChange={(e) => setSeoKeywords(e.target.value)}
                                                        className="h-8 text-sm bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                                        placeholder="例如: 產品, 服務, 優惠"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm mt-4">
                                            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer hover:text-white">
                                                <input
                                                    type="checkbox"
                                                    checked={isHomepage}
                                                    onChange={(e) => setIsHomepage(e.target.checked)}
                                                    className="rounded bg-zinc-800 border-zinc-600 accent-rose-500"
                                                />
                                                設為首頁
                                                {isHomepage && (
                                                    <span className="text-xs text-zinc-500 ml-1">(網址將忽略 slug)</span>
                                                )}
                                            </label>
                                            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer hover:text-white">
                                                <input
                                                    type="checkbox"
                                                    checked={published}
                                                    onChange={(e) => setPublished(e.target.checked)}
                                                    className="rounded bg-zinc-800 border-zinc-600 accent-rose-500"
                                                />
                                                發布
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 元件列表 */}
                        <div className="" ref={componentListRef}>
                            <div className="p-4 space-y-3 pb-4">
                                <h2 className="text-sm font-semibold text-white mb-2">頁面元件</h2>

                                {components.length === 0 ? (
                                    <div className="text-center py-12 text-zinc-500 text-sm">
                                        點擊下方按鈕新增元件
                                    </div>
                                ) : (
                                    components.map((component, index) => (
                                        <div
                                            key={component.id}
                                            id={`component-${component.id}`}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`bg-zinc-800 rounded-lg border-2 transition-all ${selectedComponentId === component.id
                                                ? 'border-rose-500'
                                                : 'border-transparent hover:border-zinc-600'
                                                }`}
                                        >
                                            <div
                                                className="flex items-center justify-between p-3 cursor-pointer"
                                                onClick={() => toggleComponent(component.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <GripVertical className="h-4 w-4 text-zinc-500 cursor-grab" />
                                                    <ChevronRight className={`h-4 w-4 text-zinc-500 transition-transform ${selectedComponentId === component.id ? 'rotate-90' : ''}`} />
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
                                                <div
                                                    className="p-3 border-t border-zinc-700 cursor-auto"
                                                    draggable={true}
                                                    onDragStart={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                    }}
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                >
                                                    <ComponentEditor
                                                        type={component.type}
                                                        props={component.props}
                                                        onChange={(props) => updateComponent(component.id, props)}
                                                        tenantId={storeId}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 新增按鈕 - 固定在底部 */}
                    <div className="p-4 bg-zinc-900 border-t border-zinc-800 z-10">
                        <Button onClick={() => setShowAddModal(true)} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            新增元件
                        </Button>
                    </div>
                </div>


                {/* 右側 - 預覽（僅桌面版顯示） */}
                <div className="hidden md:block flex-1 bg-white overflow-y-auto scrollbar-hide">
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
                    <div className="p-6 flex justify-center min-h-screen bg-zinc-50/50">
                        <div className={`transition-all duration-300 mx-auto bg-white relative ${previewMode === 'mobile'
                            ? 'w-[375px] min-h-[667px] border-[14px] border-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden'
                            : 'w-full min-h-screen shadow-sm'
                            }`}>
                            {/* Mobile Notch Simulation */}
                            {/* Mobile Notch Simulation */}
                            {previewMode === 'mobile' && (
                                <>
                                    {/* Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-zinc-900 rounded-b-[18px] z-50 flex items-center justify-center gap-3 pointer-events-none shadow-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800/50"></div>
                                        <div className="w-16 h-1 rounded-full bg-zinc-800/50"></div>
                                    </div>
                                    {/* Home Indicator */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-black/20 rounded-full z-50 pointer-events-none backdrop-blur-sm"></div>
                                </>
                            )}

                            <div className={`h-full ${previewMode === 'mobile' ? 'overflow-y-auto scrollbar-hide h-[800px] pt-[30px] pb-[40px]' : ''}`}>
                                {components.length === 0 ? (
                                    <div className="text-center py-20 text-zinc-400">
                                        尚無內容
                                    </div>
                                ) : (
                                    <PageContentRenderer
                                        content={components}
                                        storeSlug={storeSlug}
                                        tenantId={storeId}
                                        preview={true}
                                        previewDevice={previewMode}
                                        selectedId={selectedComponentId || undefined}
                                    />
                                )}
                            </div>
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
                        <div className="p-6 overflow-y-auto scrollbar-hide">
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

            {/* 手機版全螢幕預覽 */}
            {showMobilePreview && (
                <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                        <span className="text-white font-medium">頁面預覽</span>
                        <button
                            onClick={() => setShowMobilePreview(false)}
                            className="p-2 text-zinc-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
                        {components.length === 0 ? (
                            <div className="text-center py-20 text-zinc-400">
                                尚無內容
                            </div>
                        ) : (
                            <PageContentRenderer
                                content={components}
                                storeSlug={storeSlug}
                                tenantId={storeId}
                                preview={true}
                                previewDevice="mobile"
                                selectedId={selectedComponentId || undefined}
                            />
                        )}
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
        case 'marquee':
            return {
                text: 'WELCOME TO OUR STORE',
                speed: 30,
                direction: 'left',
                pauseOnHover: true,
                backgroundColor: '#000000',
                textColor: '#FFFFFF',
                fontSize: 16
            }
        case 'image_marquee':
            return {
                images: [],
                speed: 30,
                direction: 'left',
                pauseOnHover: true,
                backgroundColor: '#ffffff',
                imageHeight: 100,
                imageGap: 32
            }
        case 'image_testimonials':
            return {
                testimonials: [
                    {
                        id: 'default-1',
                        quote: "這是我用過最好的產品，細節處理得非常完美！",
                        name: "Sharon Chang",
                        designation: "Product Manager",
                        src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop"
                    }
                ],
                autoplay: false,
                autoplayDuration: 5000,
                paddingYDesktop: 0,
                paddingYMobile: 0
            }
        case 'flowing-menu-block':
            return {
                items: [
                    { link: '#', text: 'Mojave', image: 'https://picsum.photos/600/400?random=1' },
                    { link: '#', text: 'Sonoma', image: 'https://picsum.photos/600/400?random=2' },
                    { link: '#', text: 'Monterey', image: 'https://picsum.photos/600/400?random=3' },
                    { link: '#', text: 'Sequoia', image: 'https://picsum.photos/600/400?random=4' }
                ],
                speed: 15,
                textColor: '#ffffff',
                bgColor: '#060010',
                marqueeBgColor: '#ffffff',
                marqueeTextColor: '#060010',
                borderColor: '#ffffff',
                height: 600,
                paddingYDesktop: 0,
                paddingYMobile: 0
            }
        case 'image-trail-block':
            return {
                images: [
                    'https://picsum.photos/id/287/300/300',
                    'https://picsum.photos/id/1001/300/300',
                    'https://picsum.photos/id/1025/300/300',
                    'https://picsum.photos/id/1026/300/300',
                    'https://picsum.photos/id/1027/300/300'
                ],
                variant: 1,
                height: 500,
                backgroundColor: 'transparent',
                paddingYDesktop: 0,
                paddingYMobile: 0
            }
        case 'animated_text':
            return {
                text: 'OMO網站平台',
                fontSizeDesktop: 8,
                fontSizeMobile: 10,
                fontWeight: 900,
                textColor: '#1C1C1C',
                backgroundColor: '#FED75A',
                animationType: 'split-chars',
                animationDuration: 1,
                animationDelay: 0.05,
                textAlign: 'center',
                fullWidth: true,
                height: 'auto',
                paddingYDesktop: 64,
                paddingYMobile: 32
            }
        case 'gradient_text':
            return {
                text: 'OMO網站平台',
                colors: ['#5227FF', '#FF9FFC', '#B19EEF'],
                animationSpeed: 8,
                showBorder: false,
                direction: 'horizontal',
                pauseOnHover: false,
                yoyo: true,
                fontSizeDesktop: 16,
                fontSizeMobile: 14,
                textAlign: 'center',
                paddingYDesktop: 64,
                paddingYMobile: 32
            }
        case 'rotating_text':
            return {
                prefix: 'OMO網站平台',
                texts: ['is very good', 'is amazing', 'is powerful'],
                rotationInterval: 2000,
                splitBy: 'characters',
                staggerFrom: 'last',
                fontSizeDesktop: 40,
                fontSizeMobile: 24,
                fontWeight: 800,
                textAlign: 'center',
                color: '#000000',
                backgroundColor: '#cyan-300',
                paddingYDesktop: 64,
                paddingYMobile: 32
            }
        case 'pricing_2':
            return {
                title: '選擇最適合您的方案',
                description: '受到數百萬人信賴，我們為全球團隊提供服務，探索最適合您的選項。',
                primaryColor: '#000000',
                backgroundColor: '#ffffff',
                textColor: '#000000',
                paddingYDesktop: 64,
                paddingYMobile: 40,
                showAnnualToggle: true,
                monthlyLabel: '月繳',
                yearlyLabel: '年繳',
                currencySymbol: 'NT$',
                plans: [
                    {
                        name: '入門方案',
                        description: '適合個人與小型專案的基礎方案',
                        price: '50',
                        yearlyPrice: '480',
                        buttonText: '立即開始',
                        buttonHref: '#',
                        buttonVariant: 'outline',
                        features: [
                            { text: '無限卡片' },
                            { text: '自訂背景與貼圖' },
                            { text: '雙重驗證', tooltip: '透過雙重驗證保護您的帳號安全' },
                            { text: '基礎客服支援' },
                        ],
                    },
                    {
                        name: '專業方案',
                        description: '最適合成長中團隊的進階功能',
                        price: '99',
                        yearlyPrice: '990',
                        buttonText: '立即開始',
                        buttonHref: '#',
                        buttonVariant: 'default',
                        popular: true,
                        features: [
                            { text: '包含入門方案所有功能' },
                            { text: '進階清單管理' },
                            { text: '自訂欄位' },
                            { text: '雲端功能', tooltip: '自動備份至雲端' },
                            { text: '優先客服支援', tooltip: '24/7 即時支援' },
                        ],
                    },
                    {
                        name: '企業方案',
                        description: '大型團隊專屬的完整方案',
                        price: '299',
                        yearlyPrice: '2990',
                        buttonText: '聯絡我們',
                        buttonHref: '#',
                        buttonVariant: 'outline',
                        features: [
                            { text: '包含專業方案所有功能' },
                            { text: '多板管理' },
                            { text: '多板訪客' },
                            { text: '附件權限管理' },
                            { text: '專屬客戶成功經理' },
                        ],
                    },
                ]
            }
        default:
            return {}
    }
}

function ComponentEditor({ type, props, onChange, tenantId }: { type: string; props: Record<string, any>; onChange: (props: Record<string, any>) => void; tenantId?: string }) {
    switch (type) {
        case 'hero':
            return <HeroEditor props={props} onChange={onChange} />
        case 'carousel':
            return <CarouselEditor props={props} onChange={onChange} />
        case 'image_text':
            return <ImageTextEditor props={props} onChange={onChange} />
        case 'image_grid':
            return <ImageGridEditor props={props} onChange={onChange} />
        case 'text':
            return <TextEditor props={props} onChange={onChange} />
        case 'text_columns':
            return <TextColumnsEditor props={props} onChange={onChange} />
        case 'features':
            return <FeaturesEditor props={props} onChange={onChange} />
        case 'faq':
            return <FAQEditor props={props} onChange={onChange} />
        case 'product_list':
            return <ProductListEditor props={props} onChange={onChange} tenantId={tenantId} />
        case 'product_category':
            return <ProductCategoryEditor props={props} onChange={onChange} tenantId={tenantId} />
        case 'product_carousel':
            return <ProductCarouselEditor props={props} onChange={onChange} tenantId={tenantId} />
        case 'marquee':
            return <MarqueeEditor props={props} onChange={onChange} />
        case 'image_marquee':
            return <ImageMarqueeEditor props={props} onChange={onChange} tenantId={tenantId} />
        case 'image_testimonials':
            return <ImageTestimonialsEditor props={props} onChange={onChange} />
        case 'flowing-menu-block':
            return <FlowingMenuBlockEditor props={props} onChange={onChange} />
        case 'image-trail-block':
            return <ImageTrailEditor props={props} onChange={onChange} tenantId={tenantId} />
        case 'shiny_text':
            return <ShinyTextEditor props={props} onChange={onChange} />
        case 'gradient_text':
            return <GradientTextEditor props={props} onChange={onChange} />
        case 'rotating_text':
            return <RotatingTextEditor props={props} onChange={onChange} />
        case 'pricing_2': {
            // merge 預設值：只填補 undefined 的欄位，不覆蓋用戶已設定的值
            const defaults = getDefaultProps('pricing_2')
            const mergedProps = { ...defaults, ...props }
            return <PricingSection2Editor props={mergedProps} onChange={onChange} />
        }
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
    // ... copied from PageEditForm as local fallback if needed, but PageEditForm uses PageContentRenderer for desktop.
    // Wait, PageEditForm used PageContentRenderer for both?
    // StorePageEditForm uses simple fallback for mobile.
    // I'll keep the simple fallback here just in case, similar to original PageEditForm code you showed me in Step 21 which had ComponentPreview at the bottom.
    // Oh wait, PageEditForm snippet in Step 21 HAD ComponentPreview at the bottom.
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
        case 'carousel':
            return (
                <div className="py-4 mb-4 bg-gray-100 rounded-lg">
                    <div className="flex items-center justify-center h-32 bg-gray-200 rounded-lg mx-4">
                        <div className="text-center text-gray-500">
                            <div className="text-2xl mb-2">🖼️</div>
                            <div>輪播圖 ({(props.slides || []).length} 張)</div>
                        </div>
                    </div>
                </div>
            )
        case 'image_text':
            return (
                <div className="py-4 mb-4 flex gap-4 bg-gray-50 rounded-lg p-4">
                    <div className="w-1/2 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        {props.imageUrl ? <img src={props.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" /> : '圖片'}
                    </div>
                    <div className="w-1/2">
                        <h3 className="font-bold text-gray-800">{props.title || '標題'}</h3>
                        <p className="text-sm text-gray-500">{props.text || '文字內容'}</p>
                    </div>
                </div>
            )
        case 'image_grid':
            return (
                <div className="py-4 mb-4 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-2">
                        {(props.images || [{ url: '' }, { url: '' }, { url: '' }]).slice(0, 6).map((img: any, i: number) => (
                            <div key={i} className="h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                {img.url ? <img src={img.url} alt="" className="w-full h-full object-cover rounded" /> : `圖${i + 1}`}
                            </div>
                        ))}
                    </div>
                </div>
            )
        default:
            return <div className="p-4 text-center text-gray-400">預覽不支援此元件</div>
    }
}
