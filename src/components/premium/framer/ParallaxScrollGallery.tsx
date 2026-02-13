'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface ParallaxScrollGalleryProps {
    images: { url: string; alt?: string }[]
    columns?: number
    rotateX?: number
    rotateY?: number
    rotateZ?: number
    scale?: number
    verticalSpacing?: number
    horizontalSpacing?: number
    parallaxStrength?: number
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

// 簡單的種子隨機數生成器
function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

export function ParallaxScrollGallery({
    images = [],
    columns = 3,
    rotateX = 0,
    rotateY = 0,
    rotateZ = 0,
    scale = 1.0,
    verticalSpacing = 20,
    horizontalSpacing = 20,
    parallaxStrength = 1.0,
    borderRadius = 16,
    backgroundColor = '#ffffff',
    paddingYDesktop = 64,
    paddingYMobile = 32,
    title,
    subtitle,
    buttonText,
    buttonLink,
    buttonHoverColor = '#000000',
}: ParallaxScrollGalleryProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isMounted, setIsMounted] = useState(false)

    // Scroll progress: 0 at start, 1 at end
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    // Smooth scroll for parallax
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Mobile optimization: Limit columns
    const effectiveColumns = useMemo(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            return Math.min(columns, 2) // Mobile max 2 columns for better visibility
        }
        return columns
    }, [columns, isMounted])

    // Distribute images into columns
    const columnImages = useMemo(() => {
        if (!images || images.length === 0) return Array.from({ length: effectiveColumns }, () => [])

        const cols: { url: string; alt?: string }[][] = Array.from({ length: effectiveColumns }, () => [])
        images.forEach((img, i) => {
            cols[i % effectiveColumns].push(img)
        })
        return cols
    }, [images, effectiveColumns])

    // Generate random speeds/offsets per column
    const columnSettings = useMemo(() => {
        return Array.from({ length: effectiveColumns }).map((_, i) => ({
            // Center columns slower, outer columns faster (or random)
            // Example: Alternating direction or varied speeds
            speed: (1 + (i % 2 === 0 ? 0.2 : -0.2) + seededRandom(i) * 0.5) * parallaxStrength,
            marginTop: seededRandom(i * 100) * 100 // Random start offset
        }))
    }, [effectiveColumns, parallaxStrength])

    if (!images || images.length === 0) {
        return null
    }

    return (
        <div
            ref={containerRef}
            className="w-full relative overflow-hidden"
            style={{
                backgroundColor,
                paddingTop: `${paddingYMobile}px`,
                paddingBottom: `${paddingYMobile}px`,
                // Make sure container has enough height to scroll
                minHeight: '100vh'
            }}
        >
            <style jsx global>{`
                @media (min-width: 768px) {
                    .parallax-gallery-container {
                        padding-top: ${paddingYDesktop}px !important;
                        padding-bottom: ${paddingYDesktop}px !important;
                    }
                }
            `}</style>

            {/* 3D Transform Container */}
            <div
                className="parallax-gallery-container w-full h-full flex justify-center items-start"
                style={{
                    perspective: '1000px',
                    overflow: 'hidden'
                }}
            >
                <div
                    className="flex justify-center"
                    style={{
                        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                        transformOrigin: 'center top',
                        gap: `${horizontalSpacing}px`,
                        willChange: 'transform',
                    }}
                >
                    {columnImages.map((imgs, colIndex) => {
                        const settings = columnSettings[colIndex]
                        return (
                            <ParallaxColumn
                                key={colIndex}
                                images={imgs}
                                settings={settings}
                                scrollProgress={smoothProgress}
                                verticalSpacing={verticalSpacing}
                                borderRadius={borderRadius}
                            />
                        )
                    })}
                </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center text-center px-4">
                {(title || subtitle || buttonText) && (
                    <div className="bg-background/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl pointer-events-auto max-w-2xl">
                        {title && (
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                        {buttonText && (
                            <a
                                href={buttonLink || '#'}
                                className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium transition-transform hover:scale-105"
                                style={{ backgroundColor: buttonHoverColor }}
                            >
                                {buttonText}
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Gradients */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        </div>
    )
}

function ParallaxColumn({
    images,
    settings,
    scrollProgress,
    verticalSpacing,
    borderRadius
}: {
    images: { url: string; alt?: string }[],
    settings: { speed: number, marginTop: number },
    scrollProgress: any,
    verticalSpacing: number,
    borderRadius: number
}) {
    // Parallax logic: translate Y based on scroll progress
    // Move UP as we scroll down
    const y = useTransform(scrollProgress, [0, 1], [0, settings.speed * -300])

    return (
        <motion.div
            className="flex flex-col shrink-0"
            style={{
                y,
                marginTop: settings.marginTop,
                gap: `${verticalSpacing}px`,
                width: 'min(30vw, 300px)' // Responsive width
            }}
        >
            {images.map((img, i) => (
                <div
                    key={i}
                    className="w-full relative overflow-hidden shadow-lg"
                    style={{
                        borderRadius: `${borderRadius}px`,
                    }}
                >
                    <img
                        src={img.url}
                        alt={img.alt || ''}
                        className="w-full h-auto object-cover block"
                        loading="lazy"
                    />
                </div>
            ))}
            {/* Duplicate for infinite feel if needed, strictly not requested but good for parallax */}
        </motion.div>
    )
}
