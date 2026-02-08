'use client'

import { useMemo, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TiltedScrollGalleryProps {
    images: { url: string; alt?: string }[]
    columns?: number // 實際代表 Row 數量
    tiltAngle?: number
    tiltAngleY?: number
    scrollSpeed?: number
    imageSize?: number
    imageGap?: number
    borderRadius?: number
    backgroundColor?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    // 內容設定
    title?: string
    subtitle?: string
    buttonText?: string
    buttonLink?: string
    buttonHoverColor?: string
}

export function TiltedScrollGallery({
    images = [],
    columns = 3, // 實際代表 Row 數量
    tiltAngle = -15,
    tiltAngleY = 0,
    scrollSpeed = 30,
    imageSize = 250,
    imageGap = 16,
    borderRadius = 16,
    backgroundColor = '#f8f8f8',
    paddingYDesktop = 0,
    paddingYMobile = 0,
    title,
    subtitle,
    buttonText,
    buttonLink,
    buttonHoverColor = '#e11d48',
}: TiltedScrollGalleryProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    // 使用 useMemo 優化計算邏輯，移除 useEffect 和 useState
    const rowImagesMap = useMemo(() => {
        if (!images || images.length === 0) return {}

        const newRowImagesMap: Record<number, { url: string; alt?: string }[]> = {}
        const targetWidth = 3000 // 目標寬度確保無縫循環
        const itemWidth = imageSize + imageGap

        // 1. 基礎分配 (Shifted Logic)
        const baseRows = Array.from({ length: columns }, (_, rowIndex) => {
            const offset = rowIndex % images.length
            return [...images.slice(offset), ...images.slice(0, offset)]
        })

        // 2. 填充與複製 (Padding & Duplication)
        baseRows.forEach((row, rowIndex) => {
            if (row.length === 0) {
                newRowImagesMap[rowIndex] = []
                return
            }

            let currentWidth = row.length * itemWidth
            let paddedRow = [...row]

            // 確保單一循環長度足夠
            while (currentWidth < targetWidth) {
                paddedRow = [...paddedRow, ...row]
                currentWidth = paddedRow.length * itemWidth
            }

            // 複製一份以實現 0% -> -50% 的無縫動畫
            newRowImagesMap[rowIndex] = [...paddedRow, ...paddedRow]
        })

        return newRowImagesMap
    }, [images, columns, imageSize, imageGap])

    if (!images || images.length === 0) {
        return (
            <div
                className="w-full flex items-center justify-center text-muted-foreground"
                style={{
                    height: 'calc(100vh - 64px)',
                    backgroundColor,
                }}
            >
                <p>請新增圖片</p>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className="w-full overflow-hidden relative flex flex-col"
            style={{
                height: 'calc(100vh - 64px)', // 扣除導覽列高度
                backgroundColor,
                paddingTop: `${paddingYMobile}px`,
                paddingBottom: `${paddingYMobile}px`,
            }}
        >
            <style jsx global>{`
                @media (min-width: 768px) {
                    .tilted-gallery-container {
                        padding-top: ${paddingYDesktop}px !important;
                        padding-bottom: ${paddingYDesktop}px !important;
                    }
                }
                
                @keyframes scrollLeft {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                @keyframes scrollRight {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }

                /* Mobile: 預設 Right to Left (scrollLeft) */
                .animate-row-mobile {
                    animation: scrollLeft var(--duration) linear infinite;
                }
                
                /* Desktop: 改為 Left to Right (scrollRight) */
                @media (min-width: 768px) {
                    .animate-row-desktop {
                        animation: scrollRight var(--duration) linear infinite;
                    }
                }
            `}</style>

            <div className="tilted-gallery-container w-full h-full relative overflow-hidden flex items-center justify-center z-0">
                {/* 傾斜的網格容器 */}
                <div
                    className="flex flex-col justify-center items-center scale-110 sm:scale-100"
                    style={{
                        transform: `perspective(1000px) rotateX(${tiltAngle}deg) rotateY(${tiltAngleY}deg) rotateZ(0deg)`,
                        transformOrigin: 'center center',
                        width: '150%',
                        gap: `${imageGap}px`,
                    }}
                >
                    {Array.from({ length: columns }).map((_, rowIndex) => {
                        const rowImages = rowImagesMap[rowIndex] || []
                        const duration = scrollSpeed + (rowIndex * 2)

                        return (
                            <div
                                key={rowIndex}
                                className="flex w-fit animate-row-mobile md:animate-row-desktop"
                                style={{
                                    gap: `${imageGap}px`,
                                    // @ts-ignore
                                    '--duration': `${duration}s`,
                                    transform: `translateX(${rowIndex % 2 === 0 ? '-' : ''}${Math.random() * 50}px)`, // 隨機錯位
                                }}
                            >
                                {rowImages.map((img, imgIndex) => (
                                    <div
                                        key={`${rowIndex}-${imgIndex}`}
                                        className="shrink-0 overflow-hidden shadow-lg transition-transform hover:scale-105 duration-300"
                                        style={{
                                            width: `${imageSize}px`,
                                            height: `${imageSize * 0.75}px`,
                                            borderRadius: `${borderRadius}px`,
                                            marginRight: `${Math.random() * 40}px`, // 隨機間距，打破整齊感
                                        }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.alt || ''}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 內容覆蓋層 */}
            <div
                className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
                style={{ transform: 'translateZ(100px)' }}
            >
                <div
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pt-32 pb-12"
                    style={{
                        height: '100%',
                        background: `linear-gradient(to top, ${backgroundColor} 0%, ${backgroundColor}E6 40%, transparent 100%)`
                    }}
                />

                <div className="relative z-30 container mx-auto px-6 pb-12 pt-12 flex flex-col items-center text-center pointer-events-auto">
                    {title && (
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-sm text-foreground">
                            {title}
                        </h2>
                    )}

                    {subtitle && (
                        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
                            {subtitle}
                        </p>
                    )}

                    {buttonText && (
                        <a
                            href={buttonLink || '#'}
                            className="relative z-50 inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                            style={{ backgroundColor: buttonHoverColor || '#000000' }}
                        >
                            {buttonText}
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    )}
                </div>
            </div>

            {/* 頂部漸層遮罩 */}
            <div
                className="absolute inset-x-0 top-0 h-32 pointer-events-none z-10"
                style={{
                    background: `linear-gradient(to bottom, ${backgroundColor}, transparent)`,
                }}
            />
        </div>
    )
}
