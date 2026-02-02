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
