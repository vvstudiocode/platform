'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { ProductListBlock, ProductCategoryBlock, ProductCarouselBlock } from './product-blocks'

interface PageComponent {
    id?: string
    type: string
    props?: Record<string, any>
    // 兼容舊格式
    title?: string
    content?: string
    subtitle?: string
    url?: string
    alt?: string
    imageUrl?: string
    backgroundUrl?: string
}

import { ReactNode } from 'react'

// ... imports

interface Props {
    content: PageComponent[]
    storeSlug?: string
    tenantId?: string
    preview?: boolean
    previewDevice?: 'mobile' | 'desktop'
    backgroundColor?: string
    children?: ReactNode
}

export function PageContentRenderer({ content, storeSlug = '', tenantId = '', preview = false, previewDevice = 'desktop', backgroundColor = '#ffffff', children }: Props) {
    return (
        <div
            className="min-h-full w-full py-12"
            style={{ backgroundColor: backgroundColor || '#ffffff' }}
        >
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {children}
                {content.map((block, index) => (
                    <div key={block.id || index} id={`preview-${block.id}`}>
                        <ContentBlock block={block} storeSlug={storeSlug} tenantId={tenantId} preview={preview} previewDevice={previewDevice} />
                    </div>
                ))}
            </div>
        </div>
    )
}

function ContentBlock({ block, storeSlug, tenantId, preview, previewDevice }: { block: PageComponent; storeSlug: string; tenantId: string; preview: boolean; previewDevice: 'mobile' | 'desktop' }) {
    // 兼容新舊格式的取值函數
    const getVal = (key: string) => block.props?.[key] ?? (block as any)[key]

    switch (block.type) {
        case 'hero':
            return <HeroBlock block={block} />
        case 'text':
            return <TextBlock block={block} />
        case 'heading':
            return <HeadingBlock block={block} />
        case 'image':
            return <ImageBlock block={block} />
        case 'features':
            return <FeaturesBlock block={block} />
        case 'faq':
            return <FAQBlock block={block} />
        case 'carousel':
            return <CarouselBlock block={block} />
        case 'image_text':
            return <ImageTextBlock block={block} />
        case 'text_columns':
            return <TextColumnsBlock block={block} />
        case 'image_grid':
            return <ImageGridBlock block={block} />
        case 'product_list':
            return <ProductListBlock
                productIds={block.props?.productIds || []}
                title={block.props?.title}
                layout={block.props?.layout}
                columns={block.props?.columns}
                layoutDesktop={block.props?.layoutDesktop}
                columnsDesktop={block.props?.columnsDesktop}
                layoutMobile={block.props?.layoutMobile}
                columnsMobile={block.props?.columnsMobile}
                storeSlug={storeSlug}
                preview={preview}
                previewDevice={previewDevice}
            />
        case 'product_category':
            return <ProductCategoryBlock
                category={block.props?.category || ''}
                title={block.props?.title}
                limit={block.props?.limit}
                layout={block.props?.layout}
                columns={block.props?.columns}
                layoutDesktop={block.props?.layoutDesktop}
                columnsDesktop={block.props?.columnsDesktop}
                layoutMobile={block.props?.layoutMobile}
                columnsMobile={block.props?.columnsMobile}
                storeSlug={storeSlug}
                tenantId={tenantId}
                preview={preview}
                previewDevice={previewDevice}
            />
        case 'product_carousel':
            return <ProductCarouselBlock productIds={block.props?.productIds || []} title={block.props?.title} autoplay={block.props?.autoplay} interval={block.props?.interval} storeSlug={storeSlug} preview={preview} previewDevice={previewDevice} />
        default:
            return null
    }
}

// Hero Banner
function HeroBlock({ block }: { block: PageComponent }) {
    const title = block.props?.title ?? block.title
    const subtitle = block.props?.subtitle ?? block.subtitle
    const backgroundUrl = block.props?.backgroundUrl ?? block.backgroundUrl ?? block.imageUrl
    const buttonText = block.props?.buttonText
    const buttonUrl = block.props?.buttonUrl

    return (
        <div
            className="relative py-24 px-8 rounded-2xl overflow-hidden text-center"
            style={{
                backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
                backgroundColor: backgroundUrl ? undefined : '#1f2937',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10">
                {title && <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>}
                {subtitle && <p className="text-xl text-gray-200">{subtitle}</p>}
                {buttonText && (
                    <Link
                        href={buttonUrl || '#'}
                        className="inline-block mt-6 px-8 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {buttonText}
                    </Link>
                )}
            </div>
        </div>
    )
}

// 文字區塊 (Rich Text)
function TextBlock({ block }: { block: PageComponent }) {
    const {
        title,
        subtitle,
        content,
        align = 'center',
        textColor = '#000000',
        showButton = false,
        buttonText,
        buttonUrl
    } = block.props || {}

    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }[align as string] || 'text-center'

    return (
        <div className={`py-12 max-w-4xl mx-auto ${alignClass}`} style={{ color: textColor }}>
            {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
            {subtitle && <p className="text-xl opacity-80 mb-6">{subtitle}</p>}
            {content && (
                <div className="prose prose-lg max-w-none mb-8" style={{ color: textColor }}>
                    <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
                </div>
            )}
            {showButton && buttonText && (
                <div className="mt-8">
                    <Link
                        href={buttonUrl || '#'}
                        className={`inline-block px-8 py-3 rounded-full transition-all ${textColor
                            ? 'border-2 border-current hover:opacity-80'
                            : 'bg-zinc-900 text-white hover:bg-zinc-800'
                            }`}
                    >
                        {buttonText}
                    </Link>
                </div>
            )}
        </div>
    )
}

// 標題 (Legacy, now can be handled by TextBlock)
function HeadingBlock({ block }: { block: PageComponent }) {
    const content = block.props?.content ?? block.content
    return (
        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 text-center">{content}</h2>
    )
}

// 圖片
function ImageBlock({ block }: { block: PageComponent }) {
    const url = block.props?.url ?? block.url
    const alt = block.props?.alt ?? block.alt ?? ''
    return (
        <img
            src={url}
            alt={alt}
            className="w-full rounded-lg shadow-lg"
        />
    )
}

// 特色區塊
function FeaturesBlock({ block }: { block: PageComponent }) {
    const title = block.props?.title ?? block.title
    const items = block.props?.items ?? []

    return (
        <div className="py-12 bg-gray-50 rounded-2xl">
            {title && (
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">{title}</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
                {items.map((item: any, i: number) => (
                    <div key={i} className="text-center">
                        <div className="text-4xl mb-4">{item.icon}</div>
                        <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// FAQ 問答區塊
function FAQBlock({ block }: { block: PageComponent }) {
    const title = block.props?.title ?? block.title
    const items = block.props?.items ?? []

    return (
        <div className="py-12">
            {title && (
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">{title}</h2>
            )}
            <div className="space-y-4">
                {items.map((item: any, i: number) => (
                    <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
            </div>
        </div>
    )
}

// ... FAQItem ...

// ======================================
// 新增元件
// ======================================

// 1. 輪播圖 (Banner)
function CarouselBlock({ block }: { block: PageComponent }) {
    // ... (No title usually, or maybe inside?)
    // Keeping as is for now unless asked
    const images = block.props?.images ?? []
    const autoplay = block.props?.autoplay ?? true
    const interval = block.props?.interval ?? 5
    const [currentIndex, setCurrentIndex] = useState(0)

    // 自動輪播
    useEffect(() => {
        if (!autoplay || images.length === 0) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, interval * 1000)
        return () => clearInterval(timer)
    }, [autoplay, interval, images.length])

    if (images.length === 0) return null

    return (
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
            <div className="aspect-[21/9] relative">
                {images.map((img: any, i: number) => (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-500 ${i === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {img.link ? (
                            <Link href={img.link}>
                                <img
                                    src={img.url}
                                    alt={img.alt || ''}
                                    className="w-full h-full object-cover"
                                />
                            </Link>
                        ) : (
                            <img
                                src={img.url}
                                alt={img.alt || ''}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* 指示點 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_: any, i: number) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-8' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

// 2. 圖文組合
function ImageTextBlock({ block }: { block: PageComponent }) {
    const layout = block.props?.layout ?? 'left'
    const imageUrl = block.props?.imageUrl
    const title = block.props?.title
    const content = block.props?.content
    const buttonText = block.props?.buttonText
    const buttonUrl = block.props?.buttonUrl

    return (
        <div className={`flex flex-col md:flex-row gap-8 items-center ${layout === 'right' ? 'md:flex-row-reverse' : ''
            }`}>
            {/* 圖片 */}
            {imageUrl && (
                <div className="w-full md:w-1/2">
                    <img src={imageUrl} alt={title || ''} className="w-full rounded-lg shadow-lg" />
                </div>
            )}

            {/* 文字 */}
            <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
                {title && <h2 className="text-3xl font-bold text-gray-900">{title}</h2>}
                {content && <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{content}</p>}
                {buttonText && (
                    <Link
                        href={buttonUrl || '#'}
                        className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        {buttonText}
                    </Link>
                )}
            </div>
        </div>
    )
}

// 3. 文字組合
function TextColumnsBlock({ block }: { block: PageComponent }) {
    const columns = block.props?.columns ?? []
    const columnCount = block.props?.columnCount ?? 3

    return (
        <div className={`grid grid-cols-1 md:grid-cols-${columnCount} gap-8`}>
            {columns.map((col: any, i: number) => (
                <div key={i} className="space-y-3">
                    {col.title && <h3 className="text-xl font-semibold text-gray-900">{col.title}</h3>}
                    {col.content && <p className="text-gray-600 leading-relaxed">{col.content}</p>}
                </div>
            ))}
        </div>
    )
}

// 4. 圖片組合
function ImageGridBlock({ block }: { block: PageComponent }) {
    const images = block.props?.images ?? []
    const columns = block.props?.columns ?? 3
    const gap = block.props?.gap ?? 16

    return (
        <div
            className={`grid grid-cols-1 md:grid-cols-${columns}`}
            style={{ gap: `${gap}px` }}
        >
            {images.map((img: any, i: number) => (
                <div key={i} className="relative rounded-lg overflow-hidden bg-gray-100">
                    {img.link ? (
                        <Link href={img.link}>
                            <img
                                src={img.url}
                                alt={img.alt || ''}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                    ) : (
                        <img
                            src={img.url}
                            alt={img.alt || ''}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

// 商品元件已從 product-blocks.tsx 導入，不需要在此定義

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
            >
                <span className="font-medium text-gray-900">{question}</span>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-gray-600">
                    {answer}
                </div>
            )}
        </div>
    )
}
