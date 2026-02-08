'use client'

import { useActionState, useState, useEffect } from 'react'
import { ArrowLeft, Loader2, Trash2, GripVertical, Type, Image, LayoutGrid, MessageSquare, Eye, ChevronUp, ChevronDown, ChevronRight, X, ExternalLink, Plus } from 'lucide-react'
import { useRef } from 'react'
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
    CircularCarouselEditor,
    ShowcaseSliderEditor,
    TiltedScrollGalleryEditor,
} from '@/components/page-editor/component-editors'
import { PageContentRenderer } from '@/components/store/page-content-renderer'
import { CartProvider } from '@/lib/cart-context'
import { StoreFooter } from '@/components/store/store-footer'

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
        show_in_nav: boolean
        nav_order: number
        background_color?: string
        seo_title?: string
        seo_description?: string
        seo_keywords?: string
        content: PageComponent[]
    }
    updateAction: (prevState: any, formData: FormData) => Promise<{ error?: string }>
    updatePageContentAction: (pageId: string, content: any[]) => Promise<{ error?: string }>
    basePath: string // '/admin/pages' or '/app/pages'
    storeSlug?: string
    storeName?: string
    footerSettings?: any
    tenantId?: string
}

// 元件分類定義
const componentCategories = [
    {
        name: '圖片元件',
        components: [
            { type: 'hero', icon: Image, label: 'Hero Banner', description: '大型橫幅圖片' },
            { type: 'carousel', icon: Image, label: '輪播圖', description: '圖片輪播' },
            { type: 'circular_carousel', icon: Image, label: '3D 環狀輪播', description: '立體旋轉展示' },
            { type: 'showcase_slider', icon: Image, label: '焦點展示', description: '高質感全螢幕輪播' },
            { type: 'tilted_scroll_gallery', icon: Image, label: '傾斜滾動圖庫', description: '3D透視圖片牆' },
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


export function PageEditForm({ page, updateAction, updatePageContentAction, basePath, storeSlug, tenantId, storeName, footerSettings }: Props) {
    // State for settings
    const [title, setTitle] = useState(page.title)
    const [slug, setSlug] = useState(page.slug)
    const [seoTitle, setSeoTitle] = useState(page.seo_title || '')
    const [seoDescription, setSeoDescription] = useState(page.seo_description || '')
    const [seoKeywords, setSeoKeywords] = useState(page.seo_keywords || '')
    const [backgroundColor, setBackgroundColor] = useState(page.background_color || '#ffffff')
    const [isHomepage, setIsHomepage] = useState(page.is_homepage)
    const [published, setPublished] = useState(page.published)
    const [showInNav, setShowInNav] = useState(page.show_in_nav)
    const [navOrder, setNavOrder] = useState(page.nav_order)

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
            // Preserve hidden fields if they exist in props but not form
            if (showInNav) formData.append('show_in_nav', 'on')
            formData.append('nav_order', navOrder.toString())

            const settingsResult = await updateAction(null, formData)
            if (settingsResult?.error) {
                throw new Error(settingsResult.error)
            }

            // 2. Save Content
            const contentResult = await updatePageContentAction(page.id, components)
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
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* 頂部標題列 */}
            <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
                <div className="flex items-center gap-4">
                    <Link href={basePath} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-foreground max-w-[200px] truncate">{title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* 手機版預覽按鈕 */}
                    <button
                        onClick={() => setShowMobilePreview(true)}
                        className="md:hidden flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                    >
                        <Eye className="h-4 w-4" />
                        預覽
                    </button>
                    {storeSlug && published && (
                        <Link
                            href={isHomepage ? `/store/${storeSlug}` : `/store/${storeSlug}/${slug}`}
                            target="_blank"
                            className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        >
                            <ExternalLink className="h-4 w-4" />
                            查看頁面
                        </Link>
                    )}
                    <Button onClick={saveContent} disabled={saving || isSaved} className="min-w-[110px]">
                        <Loader2 className={`h-4 w-4 animate-spin mr-2 ${saving ? '' : 'hidden'}`} />
                        <span>
                            {saving ? '儲存中...' : isSaved ? '已儲存' : '儲存內容'}
                        </span>
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mx-6 mt-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4">
                    {error}
                </div>
            )}

            {/* 主內容區 - 左右分割 */}
            <div className="flex-1 flex overflow-hidden">
                {/* 左側 - 元件列表編輯 */}
                <div className="w-full md:w-96 bg-card md:border-r border-border flex flex-col">
                    {/* 頁面設定 - 可收合 */}
                    <div className="border-b border-border">
                        <button
                            type="button"
                            onClick={() => setSettingsCollapsed(!settingsCollapsed)}
                            className="w-full flex items-center justify-between p-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
                        >
                            <span>頁面設定</span>
                            <ChevronRight className={`h-4 w-4 transition-transform ${settingsCollapsed ? '' : 'rotate-90'}`} />
                        </button>
                        {!settingsCollapsed && (
                            <div className="px-4 pb-4">
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="title" className="text-xs text-muted-foreground">頁面標題</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="h-8 text-sm bg-muted/50 border-border text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="slug" className="text-xs text-muted-foreground">頁面網址</Label>
                                        <Input
                                            id="slug"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            className="h-8 text-sm bg-muted/50 border-border text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">背景顏色</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="color"
                                                value={backgroundColor}
                                                onChange={(e) => setBackgroundColor(e.target.value)}
                                                className="w-8 h-8 rounded cursor-pointer bg-transparent border border-input"
                                            />
                                            <Input
                                                value={backgroundColor}
                                                onChange={(e) => setBackgroundColor(e.target.value)}
                                                className="h-8 text-sm flex-1 bg-muted/50 border-border text-foreground"
                                                placeholder="#ffffff"
                                            />
                                        </div>
                                    </div>

                                    {/* SEO Settings */}
                                    <div className="pt-2 border-t border-border">
                                        <h3 className="text-xs font-semibold text-muted-foreground mb-2">SEO 設定</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <Label htmlFor="seo_title" className="text-xs text-muted-foreground">SEO 標題 (Title)</Label>
                                                <Input
                                                    id="seo_title"
                                                    value={seoTitle}
                                                    onChange={(e) => setSeoTitle(e.target.value)}
                                                    className="h-8 text-sm bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                                                    placeholder="預設使用頁面標題"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="seo_description" className="text-xs text-muted-foreground">SEO 描述 (Description)</Label>
                                                <textarea
                                                    id="seo_description"
                                                    value={seoDescription}
                                                    onChange={(e) => setSeoDescription(e.target.value)}
                                                    className="w-full flex min-h-[60px] rounded-md border border-border bg-muted/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder="簡短描述此頁面內容..."
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="seo_keywords" className="text-xs text-muted-foreground">SEO 關鍵字 (Keywords)</Label>
                                                <Input
                                                    id="seo_keywords"
                                                    value={seoKeywords}
                                                    onChange={(e) => setSeoKeywords(e.target.value)}
                                                    className="h-8 text-sm bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                                                    placeholder="例如: 產品, 服務, 優惠"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm mt-4">
                                        <label className="flex items-center gap-2 text-foreground cursor-pointer hover:opacity-80">
                                            <input
                                                type="checkbox"
                                                checked={isHomepage}
                                                onChange={(e) => setIsHomepage(e.target.checked)}
                                                className="rounded border-input accent-primary"
                                            />
                                            設為首頁
                                        </label>
                                        <label className="flex items-center gap-2 text-foreground cursor-pointer hover:opacity-80">
                                            <input
                                                type="checkbox"
                                                checked={published}
                                                onChange={(e) => setPublished(e.target.checked)}
                                                className="rounded border-input accent-primary"
                                            />
                                            發布
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 元件列表 */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide" ref={componentListRef}>
                        <div className="p-4 space-y-3 pb-20">
                            <h2 className="text-sm font-semibold text-foreground mb-2">頁面元件</h2>

                            {components.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground text-sm">
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
                                        className={`bg-card rounded-lg border-2 transition-all ${selectedComponentId === component.id
                                            ? 'border-primary ring-1 ring-primary'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div
                                            className="flex items-center justify-between p-3 cursor-pointer"
                                            onClick={() => toggleComponent(component.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedComponentId === component.id ? 'rotate-90' : ''}`} />
                                                <span className="font-medium text-sm text-foreground">{getComponentLabel(component.type)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); moveComponent(index, index - 1) }}
                                                    disabled={index === 0}
                                                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); moveComponent(index, index + 1) }}
                                                    disabled={index === components.length - 1}
                                                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeComponent(component.id) }}
                                                    className="p-1 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        {selectedComponentId === component.id && (
                                            <div
                                                className="p-3 border-t border-border cursor-auto bg-muted/30"
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
                                                    tenantId={tenantId}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 新增按鈕 - 固定在底部 */}
                    <div className="sticky bottom-0 p-4 bg-card border-t border-border z-10">
                        <Button onClick={() => setShowAddModal(true)} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            新增元件
                        </Button>
                    </div>
                </div>


                {/* 右側 - 預覽（僅桌面版顯示） */}
                <div className="hidden md:block flex-1 bg-muted/10 overflow-y-auto scrollbar-hide">
                    <div className="sticky top-0 bg-background px-4 py-2 border-b border-border z-[100] flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">預覽</span>
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                            <button
                                onClick={() => setPreviewMode('desktop')}
                                className={`px-3 py-1 text-xs rounded transition-colors ${previewMode === 'desktop'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                title="桌面版"
                            >
                                💻 桌面
                            </button>
                            <button
                                onClick={() => setPreviewMode('mobile')}
                                className={`px-3 py-1 text-xs rounded transition-colors ${previewMode === 'mobile'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                title="手機版"
                            >
                                📱 手機
                            </button>
                        </div>
                    </div>
                    <div className="p-6 flex justify-center h-full">
                        <div className={`transition-all duration-300 mx-auto bg-white relative ${previewMode === 'mobile'
                            ? 'w-[390px] h-[844px] rounded-[50px] shadow-2xl border-[8px] border-zinc-900 overflow-hidden ring-4 ring-zinc-300 my-auto'
                            : 'w-full h-full shadow-sm'
                            }`}>

                            {/* Mobile Notch Simulation */}
                            {previewMode === 'mobile' && (
                                <>
                                    {/* Island/Notch Area */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-b-[20px] z-20 flex items-center justify-center gap-3 pointer-events-none">
                                        <div className="w-2 h-2 rounded-full bg-zinc-800/80"></div>
                                        <div className="w-16 h-1.5 rounded-full bg-zinc-800/80"></div>
                                    </div>

                                    {/* Status Bar Time (Fake) */}
                                    <div className="absolute top-3 left-8 text-xs font-bold text-black z-10 select-none">9:41</div>

                                    {/* Status Bar Icons (Fake) */}
                                    <div className="absolute top-3 right-8 flex gap-1.5 z-10">
                                        <div className="w-4 h-3 bg-black rounded-[2px] opacity-80"></div>
                                        <div className="w-3 h-3 bg-black rounded-full opacity-80"></div>
                                    </div>

                                    {/* Home Indicator */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-black/40 rounded-full z-20 pointer-events-none backdrop-blur-sm"></div>
                                </>
                            )}

                            {/* Content Area - Scrollable inside the phone frame */}
                            <div
                                className={`h-full w-full bg-white relative ${previewMode === 'mobile'
                                    ? 'overflow-y-auto overflow-x-hidden scrollbar-hide'
                                    : ''
                                    }`}
                                style={{
                                    backgroundColor: backgroundColor || '#ffffff',
                                    paddingTop: previewMode === 'mobile' ? '40px' : '0', // Space for status bar
                                    paddingBottom: previewMode === 'mobile' ? '20px' : '0' // Space for home indicator
                                }}
                            >
                                {components.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-muted-foreground p-8 text-center">
                                        尚無內容
                                    </div>
                                ) : (
                                    <div className="min-h-0">
                                        <CartProvider>
                                            <PageContentRenderer
                                                content={components}
                                                storeSlug={storeSlug}
                                                tenantId={tenantId}
                                                preview={true}
                                                backgroundColor={backgroundColor}
                                                previewDevice={previewMode}
                                                selectedId={selectedComponentId || undefined}
                                            />
                                        </CartProvider>
                                    </div>
                                )}

                                {/* Footer (Only show in mobile preview to complete the look, or both if desired) */}
                                {previewMode === 'mobile' && (
                                    <StoreFooter
                                        storeName={storeName || '商店名稱'}
                                        storeSlug={storeSlug || ''}
                                        settings={footerSettings}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 新增元件彈窗 - 兩欄分類顯示 */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                    <div className="bg-card rounded-xl border border-border w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h3 className="text-xl font-bold text-foreground">選擇元件類型</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto scrollbar-hide">
                            <div className="space-y-8">
                                {componentCategories.map((category) => (
                                    <div key={category.name}>
                                        <h4 className="text-sm font-semibold text-muted-foreground mb-3">{category.name}</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {category.components.map((ct) => (
                                                <button
                                                    key={ct.type}
                                                    onClick={() => addComponent(ct.type)}
                                                    className="flex items-start gap-3 p-4 bg-muted/50 hover:bg-accent rounded-lg text-left transition-colors group border border-border hover:border-accent"
                                                >
                                                    <div className="p-2 bg-muted group-hover:bg-background rounded-lg transition-colors">
                                                        <ct.icon className="h-5 w-5 text-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-foreground mb-1">{ct.label}</div>
                                                        <div className="text-xs text-muted-foreground">{ct.description}</div>
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
                <div className="md:hidden fixed inset-0 z-[200] bg-background flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                        <span className="text-foreground font-medium">頁面預覽</span>
                        <button
                            onClick={() => setShowMobilePreview(false)}
                            className="p-2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
                        {components.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground">
                                尚無內容
                            </div>
                        ) : (
                            <CartProvider>
                                <PageContentRenderer
                                    content={components}
                                    storeSlug={storeSlug}
                                    tenantId={tenantId}
                                    preview={true}
                                    backgroundColor={backgroundColor}
                                    previewDevice="mobile"
                                    selectedId={selectedComponentId || undefined}
                                />
                            </CartProvider>
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
        case 'circular_carousel':
            return {
                images: [
                    { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', alt: 'Nike Red', link: '' },
                    { url: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f', alt: 'Nike Blue', link: '' },
                    { url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111', alt: 'Nike Green', link: '' },
                    { url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3', alt: 'Nike Orange', link: '' },
                    { url: 'https://images.unsplash.com/photo-1560769629-9750c3c0ce99', alt: 'Nike Grey', link: '' }
                ],
                autoRotate: true,
                radius: 300,
                height: 400,
                itemWidth: 200,
                itemHeight: 300
            }
        case 'showcase_slider':
            return {
                slides: [
                    {
                        image: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?q=80&w=3270',
                        title: 'Elegance',
                        subtitle: 'Premium Collection',
                        buttonText: 'View Collection',
                        link: ''
                    },
                    {
                        image: 'https://images.unsplash.com/photo-1509319117193-51043812013d?q=80&w=3270',
                        title: 'Sophistication',
                        subtitle: 'New Arrivals',
                        buttonText: 'Shop Now',
                        link: ''
                    }
                ],
                autoplay: true,
                height: '100vh'
            }
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
        case 'tilted_scroll_gallery':
            return {
                images: [
                    { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', alt: 'Image 1' },
                    { url: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f', alt: 'Image 2' },
                    { url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111', alt: 'Image 3' },
                    { url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3', alt: 'Image 4' },
                    { url: 'https://images.unsplash.com/photo-1560769629-9750c3c0ce99', alt: 'Image 5' },
                    { url: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842', alt: 'Image 6' },
                ],
                columns: 3,
                tiltAngle: -15,
                tiltAngleY: 0,
                scrollSpeed: 30,
                imageSize: 150,
                imageGap: 16,
                borderRadius: 16,
                backgroundColor: '#f8f8f8',
                title: 'Discover Collections',
                subtitle: 'Explore the top collection of items and find your favorites.',
                buttonText: 'Start Experience',
                buttonLink: '#',
                buttonHoverColor: '#e11d48'
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
        case 'circular_carousel':
            return <CircularCarouselEditor props={props} onChange={onChange} />
        case 'showcase_slider':
            return <ShowcaseSliderEditor props={props} onChange={onChange} />
        case 'image_text':
            return <ImageTextEditor props={props} onChange={onChange} />
        case 'image_grid':
            return <ImageGridEditor props={props} onChange={onChange} />
        case 'text':
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
        case 'tilted_scroll_gallery':
            return <TiltedScrollGalleryEditor props={props} onChange={onChange} />
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
        case 'text':
            return (
                <div className="py-6 px-4 mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{props.content || '內容'}</p>
                </div>
            )
        case 'text_columns':
            return (
                <div className="py-4 mb-4 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                        {(props.columns || [{ title: '欄位 1', content: '內容' }, { title: '欄位 2', content: '內容' }]).map((col: any, i: number) => (
                            <div key={i} className="p-3 bg-white rounded border border-gray-200">
                                <h4 className="font-medium text-gray-800">{col.title}</h4>
                                <p className="text-sm text-gray-500">{col.content}</p>
                            </div>
                        ))}
                    </div>
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
        case 'product_list':
            return (
                <div className="py-4 mb-4 bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-3">{props.title || '商品列表'}</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: Math.min((props.productIds || []).length || 4, 4) }).map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                商品 {i + 1}
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">已選 {(props.productIds || []).length} 個商品</div>
                </div>
            )
        case 'product_category':
            return (
                <div className="py-4 mb-4 bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">分類商品</h3>
                    <div className="text-sm text-gray-500">分類: {props.category || '未選擇'}</div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                商品
                            </div>
                        ))}
                    </div>
                </div>
            )
        case 'product_carousel':
            return (
                <div className="py-4 mb-4 bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-800 mb-2">{props.title || '商品輪播'}</h3>
                    <div className="flex gap-2 overflow-hidden">
                        {Array.from({ length: Math.min((props.productIds || []).length || 3, 4) }).map((_, i) => (
                            <div key={i} className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                商品 {i + 1}
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">已選 {(props.productIds || []).length} 個商品</div>
                </div>
            )
        default:
            return <div className="py-4 text-gray-400">未知元件: {type}</div>
    }
}
