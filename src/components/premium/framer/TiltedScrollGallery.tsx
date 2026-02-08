'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface TiltedScrollGalleryProps {
    images: { url: string; alt?: string }[]
    columns?: number
    tiltAngle?: number
    tiltAngleY?: number
    scrollSpeed?: number
    imageSize?: number
    imageGap?: number
    borderRadius?: number
    backgroundColor?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    title?: string
    subtitle?: string
    buttonText?: string
    buttonLink?: string
    buttonHoverColor?: string
}

// 簡單的種子隨機數生成器（避免 hydration mismatch）
function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

export function TiltedScrollGallery({
    images = [],
    columns = 3,
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
    const isInView = useInView(containerRef, { once: false, amount: 0.1 })
    const [isMounted, setIsMounted] = useState(false)

    // 等待客戶端掛載後才顯示動畫（避免 hydration mismatch）
    useEffect(() => {
        setIsMounted(true)
    }, [])

    // 使用種子隨機數（確保 SSR 和 CSR 一致）
    const randomValues = useMemo(() => ({
        rowOffsets: Array.from({ length: columns }, (_, i) => {
            const value = (i % 2 === 0 ? -1 : 1) * (20 + seededRandom(i * 100 + columns) * 30)
            return Math.round(value * 100) / 100 // 固定2位小數，避免精度問題
        }),
        itemGaps: Array.from({ length: 20 }, (_, i) => {
            const value = imageGap + seededRandom(i * 50 + imageGap * 10) * 20
            return Math.round(value * 100) / 100 // 固定2位小數，避免精度問題
        }),
    }), [columns, imageGap])

    // 計算每個 Row 的圖片（使用 Shifted 策略）
    const rowImagesMap = useMemo(() => {
        if (!images || images.length === 0) return {}

        const newRowImagesMap: Record<number, { url: string; alt?: string }[]> = {}
        const targetWidth = typeof window !== 'undefined' ? window.innerWidth * 2 : 3000
        const itemWidth = imageSize + imageGap

        const baseRows = Array.from({ length: columns }, (_, rowIndex) => {
            const offset = rowIndex % images.length
            return [...images.slice(offset), ...images.slice(0, offset)]
        })

        baseRows.forEach((row, rowIndex) => {
            if (row.length === 0) {
                newRowImagesMap[rowIndex] = []
                return
            }

            let currentWidth = row.length * itemWidth
            let paddedRow = [...row]

            while (currentWidth < targetWidth) {
                paddedRow = [...paddedRow, ...row]
                currentWidth = paddedRow.length * itemWidth
            }

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
                height: 'calc(100vh - 64px)',
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
            `}</style>

            <div className="tilted-gallery-container w-full h-full relative overflow-hidden flex items-center justify-center z-0">
                <div
                    className="flex flex-col justify-center items-center scale-110 sm:scale-100"
                    style={{
                        transform: `perspective(1000px) rotateX(${tiltAngle}deg) rotateY(${tiltAngleY}deg) rotateZ(0deg)`,
                        transformOrigin: 'center center',
                        width: '150%',
                        gap: `${imageGap}px`,
                        willChange: 'transform',
                    }}
                >
                    {Array.from({ length: columns }).map((_, rowIndex) => {
                        const rowImages = rowImagesMap[rowIndex] || []
                        const duration = scrollSpeed + (rowIndex * 2)
                        const rowOffset = randomValues.rowOffsets[rowIndex]

                        return (
                            <motion.div
                                key={rowIndex}
                                className="flex w-fit"
                                initial={{ x: rowOffset }}
                                animate={isInView ? {
                                    x: [rowOffset, rowOffset - 2000]
                                } : { x: rowOffset }}
                                transition={{
                                    duration: duration,
                                    repeat: Infinity,
                                    ease: 'linear',
                                    repeatType: 'loop',
                                }}
                                style={{
                                    gap: `${imageGap}px`,
                                    willChange: 'transform',
                                }}
                            >
                                {rowImages.map((img, imgIndex) => (
                                    <motion.div
                                        key={`${rowIndex}-${imgIndex}`}
                                        className="shrink-0 overflow-hidden shadow-lg"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            width: `${imageSize}px`,
                                            height: `${imageSize * 0.75}px`,
                                            borderRadius: `${borderRadius}px`,
                                            marginRight: `${randomValues.itemGaps[imgIndex % randomValues.itemGaps.length]}px`,
                                        }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.alt || ''}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
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

                <motion.div
                    className="relative z-30 container mx-auto px-6 pb-12 pt-12 flex flex-col items-center text-center pointer-events-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {title && (
                        <motion.h2
                            className="text-3xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-sm text-foreground"
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            {title}
                        </motion.h2>
                    )}

                    {subtitle && (
                        <motion.p
                            className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-8 leading-relaxed"
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    {buttonText && (
                        <motion.a
                            href={buttonLink || '#'}
                            className="relative z-50 inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium"
                            style={{ backgroundColor: buttonHoverColor || '#000000' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            {buttonText}
                            <ArrowRight className="w-4 h-4" />
                        </motion.a>
                    )}
                </motion.div>
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
