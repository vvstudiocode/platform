'use client'

import { useActionState, useState, useEffect } from 'react'
import { ArrowLeft, Loader2, Trash2, GripVertical, Type, Image, LayoutGrid, MessageSquare, Eye, ChevronUp, ChevronDown, ChevronRight, X, ExternalLink, Plus, Box, Sparkles, MessageSquareQuote, Lock } from 'lucide-react'
import { useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDefaultProps as getRegistryDefaultProps, getComponentEditor, componentRegistry, getComponentConfig } from '@/components/page-editor/registry'
import { UpsellModal } from './upsell-modal'
import { PreviewModal } from './preview-modal'
import { ImageMarqueeEditor } from '@/components/page-editor/editors/ImageMarqueeEditor' // Direct import if registry is not updated or to be safe? 
// Wait, PageEditForm uses `getComponentEditor(type)`. 
// I should update `src/components/page-editor/registry.ts` instead of importing here?
// Step 298 line 725: `const Editor = getComponentEditor(type)`.
// So I should UPDATE REGISTRY.TS.
// Does StorePageEditForm use registry?
// Step 299 lines 9-20: It imports editors directly!
// So StorePageEditForm and PageEditForm use DIFFERENT patterns!
// PageEditForm uses REGISTRY.
// StorePageEditForm uses DIRECT IMPORTS (as seen in my previous edits).
// So for PageEditForm, I must update `src/components/page-editor/registry.ts`.
// I should check `src/components/page-editor/registry.ts`.
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
    subscriptionPlan?: 'free' | 'growth'
}

// 元件分類定義
const componentCategories = [
    {
        name: '圖片元件',
        components: [
            { type: 'hero', icon: Image, label: 'Hero Banner', description: '大型橫幅圖片' },
            { type: 'carousel', icon: Image, label: '輪播圖', description: '圖片輪播' },
            { type: 'showcase_slider', icon: Image, label: '焦點展示', description: '高質感全螢幕輪播' },

            { type: 'image_text', icon: LayoutGrid, label: '圖文組合', description: '圖片+文字' },
            { type: 'image_grid', icon: LayoutGrid, label: '圖片組合', description: '多圖網格' },
            { type: 'image_testimonials', icon: MessageSquareQuote, label: '動態見證牆', description: '客戶好評與見證' },
            { type: 'hero_composition', icon: Image, label: '現代 Hero', description: '高質感圖文 Hero' },
            { type: 'image_card_grid', icon: LayoutGrid, label: '圖片卡片網格', description: '展示目的地或分類' },
            { type: 'magazine_grid', icon: LayoutGrid, label: '雜誌排版', description: '圖文並茂的雜誌佈局' },
            { type: 'testimonial_showcase', icon: MessageSquareQuote, label: '見證展示', description: '豐富的客戶見證展示' },
            { type: 'scrollable_cards', icon: LayoutGrid, label: '滾動卡片', description: '橫向捲動服務卡片' },
            { type: 'portfolio_grid', icon: LayoutGrid, label: '作品集網格', description: '拼圖式作品展示' },
        ]
    },
    {
        name: '文字元件',
        components: [
            { type: 'text', icon: Type, label: '文字區塊', description: '純文字內容' },
            { type: 'animated_text', icon: Sparkles, label: '動態文字', description: '動畫效果文字' },
            { type: 'text_columns', icon: LayoutGrid, label: '文字組合', description: '多欄文字' },
            { type: 'features', icon: LayoutGrid, label: '特色區塊', description: '特色/服務' },
            { type: 'faq', icon: MessageSquare, label: 'FAQ 問答', description: '常見問答' },
            { type: 'newsletter_banner', icon: MessageSquare, label: '訂閱 Banner', description: '電子報訂閱區塊' },
            { type: 'stats_grid', icon: LayoutGrid, label: '數據指標', description: '公司介紹與數據展示' },
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
            { type: 'marquee_3d', icon: LayoutGrid, label: '3D 跑馬燈', description: '3D 立體圖片展示' },
            { type: 'apple_cards_carousel', icon: LayoutGrid, label: '滑動卡片', description: 'Apple 風格滑動卡片' },
            { type: 'threads_block', icon: Sparkles, label: 'Threads 背景', description: 'WebGL 互動背景效果' },
            { type: 'flowing-menu-block', icon: LayoutGrid, label: '流動選單', description: 'GSAP 流動選單效果' },
            { type: 'image-trail-block', icon: Sparkles, label: '圖片軌跡', description: '滑鼠軌跡圖片效果' },
            { type: 'before_after', icon: LayoutGrid, label: 'Before/After', description: '前後對比效果' },
        ]
    },
]

// 平鋪所有元件（用於查找）
const allComponentTypes = componentCategories.flatMap(cat => cat.components)


export function PageEditForm({ page, updateAction, updatePageContentAction, basePath, storeSlug, tenantId, storeName, footerSettings, subscriptionPlan = 'free' }: Props) {
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
    const [upsellOpen, setUpsellOpen] = useState(false)
    const [upsellFeatureName, setUpsellFeatureName] = useState('')
    const [previewModalOpen, setPreviewModalOpen] = useState(false)
    const [previewComponentType, setPreviewComponentType] = useState<string | null>(null)
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
        const config = getComponentConfig(type)
        const isGrowthOnly = config?.tier === 'growth'
        const isFreePlan = subscriptionPlan === 'free'

        if (isGrowthOnly && isFreePlan) {
            setUpsellFeatureName(config?.label || '進階元件')
            setUpsellOpen(true)
            return
        }

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
                            href={
                                isHomepage
                                    ? (storeSlug === 'omo' ? '/' : `/store/${storeSlug}`)
                                    : (storeSlug === 'omo' ? `/${slug}` : `/store/${storeSlug}/${slug}`)
                            }
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
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
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
                                                value={isHomepage ? '' : slug}
                                                onChange={(e) => setSlug(e.target.value)}
                                                disabled={isHomepage}
                                                className="h-8 text-sm bg-muted/50 border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder={isHomepage ? "首頁不需設定網址" : ""}
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
                                                {isHomepage && (
                                                    <span className="text-xs text-muted-foreground ml-1">(網址將忽略 slug)</span>
                                                )}
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
                        <div className="" ref={componentListRef}>
                            <div className="p-4 space-y-3 pb-4">
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
                    </div>

                    {/* 新增按鈕 - 固定在底部 */}
                    <div className="p-4 bg-card border-t border-border z-10">
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
                                {storeName && (
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
                                            {category.components.map((ct) => {
                                                const config = getComponentConfig(ct.type)
                                                const isLocked = config?.tier === 'growth' && subscriptionPlan === 'free'

                                                return (
                                                    <div
                                                        key={ct.type}
                                                        onClick={() => addComponent(ct.type)}
                                                        className={`relative flex items-start gap-3 p-4 rounded-lg text-left transition-colors group border cursor-pointer select-none ${isLocked
                                                            ? 'bg-muted/30 border-border opacity-70 hover:bg-muted/50'
                                                            : 'bg-muted/50 hover:bg-accent border-border hover:border-accent'
                                                            }`}
                                                        role="button"
                                                    >
                                                        <button
                                                            className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md opacity-0 group-hover:opacity-100 transition-all z-10"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setPreviewComponentType(ct.type)
                                                                setPreviewModalOpen(true)
                                                            }}
                                                            title="預覽此元件"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <div className={`p-2 rounded-lg transition-colors relative ${isLocked ? 'bg-muted' : 'bg-muted group-hover:bg-background'
                                                            }`}>
                                                            <ct.icon className="h-5 w-5 text-foreground" />
                                                            {isLocked && (
                                                                <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full p-0.5 shadow-sm">
                                                                    <Lock className="h-2.5 w-2.5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="font-medium text-foreground">{ct.label}</div>
                                                                {isLocked && <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium border border-yellow-200">Growth</span>}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">{ct.description}</div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
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
            <UpsellModal
                open={upsellOpen}
                onOpenChange={setUpsellOpen}
                featureName={upsellFeatureName}
            />
            <PreviewModal
                open={previewModalOpen}
                onOpenChange={setPreviewModalOpen}
                componentType={previewComponentType}
                storeSlug={storeSlug}
                tenantId={tenantId}
            />
        </div>
    )
}

function getComponentLabel(type: string): string {
    const component = allComponentTypes.find(ct => ct.type === type)
    return component?.label || type
}

function getDefaultProps(type: string): Record<string, any> {
    // 使用 registry 的預設值，如果沒有則提供本地後備值
    const registryProps = getRegistryDefaultProps(type)
    if (Object.keys(registryProps).length > 0) {
        return registryProps
    }
    // 後備值（用於尚未加入 registry 的元件）
    switch (type) {
        case 'circular_carousel':
            return {
                images: [
                    { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', alt: 'Nike Red', link: '' },
                    { url: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f', alt: 'Nike Blue', link: '' },
                ],
                autoRotate: true,
                radius: 300,
                height: 400
            }
        default:
            return {}
    }
}

function ComponentEditor({ type, props, onChange, tenantId }: { type: string; props: Record<string, any>; onChange: (props: Record<string, any>) => void; tenantId?: string }) {
    // 使用 registry 取得對應的編輯器元件
    const Editor = getComponentEditor(type)

    if (Editor) {
        return <Editor props={props} onChange={onChange} tenantId={tenantId} />
    }

    return (
        <div className="text-zinc-500 text-sm">
            此元件類型的編輯器開發中
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
