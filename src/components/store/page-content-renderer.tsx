'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

interface PageComponent {
    id?: string
    type: string
    props?: Record<string, any>
    // 兼容舊格式
    content?: string
    title?: string
    subtitle?: string
    url?: string
    alt?: string
    imageUrl?: string
    backgroundUrl?: string
}

interface Props {
    content: PageComponent[]
}

export function PageContentRenderer({ content }: Props) {
    return (
        <div className="space-y-8">
            {content.map((block, index) => (
                <ContentBlock key={block.id || index} block={block} />
            ))}
        </div>
    )
}

function ContentBlock({ block }: { block: PageComponent }) {
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
            return <ProductListBlock block={block} />
        case 'product_category':
            return <ProductCategoryBlock block={block} />
        case 'product_carousel':
            return <ProductCarouselBlock block={block} />
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

// 文字區塊
function TextBlock({ block }: { block: PageComponent }) {
    const content = block.props?.content ?? block.content
    return (
        <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
    )
}

// 標題
function HeadingBlock({ block }: { block: PageComponent }) {
    const content = block.props?.content ?? block.content
    return (
        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">{content}</h2>
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
                <h2 className="text-2xl font-bold text-gray-800 mb-8">{title}</h2>
            )}
            <div className="space-y-4">
                {items.map((item: any, i: number) => (
                    <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
            </div>
        </div>
    )
}

// FAQ 單項（可展開/收合）
function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
            >
                <span className="font-medium text-gray-900">{question}</span>
                <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="px-4 pb-4 bg-white">
                    <p className="text-gray-600 leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    )
}

// ======================================
// 新增元件
// ======================================

// 1. 輪播圖
function CarouselBlock({ block }: { block: PageComponent }) {
    const images = block.props?.images ?? []
    const autoplay = block.props?.autoplay ?? true
    const interval = block.props?.interval ?? 5
    const [currentIndex, setCurrentIndex] = useState(0)

    // 自動輪播
    useState(() => {
        if (!autoplay || images.length === 0) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, interval * 1000)
        return () => clearInterval(timer)
    })

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
            <div className="w-full md:w-1/2 space-y-4">
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

// 5-7. 商品相關元件（佔位符，需要實際資料）
function ProductListBlock({ block }: { block: PageComponent }) {
    const title = block.props?.title
    const productIds = block.props?.productIds ?? []
    const layout = block.props?.layout ?? 'grid'
    const columns = block.props?.columns ?? 3

    return (
        <div className="space-y-6">
            {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
            <div className={layout === 'grid' ? `grid grid-cols-1 md:grid-cols-${columns} gap-6` : 'space-y-4'}>
                {productIds.map((id: string) => (
                    <div key={id} className="border rounded-lg p-4">
                        {/* 商品卡片 - 需整合實際商品資料 */}
                        <div className="text-gray-500">商品 {id}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ProductCategoryBlock({ block }: { block: PageComponent }) {
    const title = block.props?.title
    const category = block.props?.category
    const limit = block.props?.limit ?? 8

    return (
        <div className="space-y-6">
            {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
            <div className="text-gray-500">分類 {category} 的商品（最多 {limit} 個）</div>
        </div>
    )
}

function ProductCarouselBlock({ block }: { block: PageComponent }) {
    const title = block.props?.title
    const productIds = block.props?.productIds ?? []

    return (
        <div className="space-y-6">
            {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
            <div className="text-gray-500">商品輪播（{productIds.length} 個商品）</div>
        </div>
    )
}
