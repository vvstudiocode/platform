'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface BeforeAfterSliderProps {
    beforeImage: string
    afterImage: string
    beforeLabel?: string
    afterLabel?: string
    sliderColor?: string
    orientation?: 'horizontal' | 'vertical'
    className?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    backgroundColor?: string
}

export function BeforeAfterSlider({
    beforeImage,
    afterImage,
    beforeLabel,
    afterLabel,
    sliderColor = '#ffffff',
    orientation = 'horizontal', // currently only horizontal supported
    className,
    paddingYDesktop = 0,
    paddingYMobile = 0,
    backgroundColor
}: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isResizing, setIsResizing] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPosition(percent)
    }, [])

    // Add global mouse up listener to stop resizing even if mouse leaves component
    useEffect(() => {
        const handleGlobalMouseUp = () => setIsResizing(false)
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isResizing) handleMove(e.clientX)
        }

        window.addEventListener('mouseup', handleGlobalMouseUp)
        window.addEventListener('mousemove', handleGlobalMouseMove)

        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp)
            window.removeEventListener('mousemove', handleGlobalMouseMove)
        }
    }, [isResizing, handleMove])

    const handleTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX)
    }

    return (
        <div
            className={cn("w-full relative overflow-hidden select-none touch-none bg-background", className)}
            style={{
                paddingTop: `${paddingYMobile}px`,
                paddingBottom: `${paddingYMobile}px`,
                ['--padding-desktop' as any]: `${paddingYDesktop}px`,
                backgroundColor: backgroundColor
            }}
        >
            <style jsx>{`
                @media (min-width: 768px) {
                    div[style*="--padding-desktop"] {
                        padding-top: var(--padding-desktop) !important;
                        padding-bottom: var(--padding-desktop) !important;
                    }
                }
            `}</style>

            {/* Main Container */}
            <div
                ref={containerRef}
                className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden cursor-ew-resize group"
                onMouseDown={(e) => {
                    handleMove(e.clientX)
                    setIsResizing(true)
                }}
                onTouchMove={handleTouchMove}
            >
                {/* 1. After Image (Background - Right Side Image) */}
                <div className="absolute inset-0 w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={afterImage}
                        alt="After"
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                    />
                    {afterLabel && (
                        <div className="absolute top-4 right-4 z-10 bg-black/50 text-white px-2 py-1 rounded text-sm font-medium backdrop-blur-sm pointer-events-none">
                            {afterLabel}
                        </div>
                    )}
                </div>

                {/* 2. Before Image (Foreground - Left Side Image - Clipped) */}
                {/* using clip-path to reveal only the left part */}
                <div
                    className="absolute inset-0 w-full h-full overflow-hidden"
                    style={{
                        clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={beforeImage}
                        alt="Before"
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                    />
                    {beforeLabel && (
                        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-2 py-1 rounded text-sm font-medium backdrop-blur-sm pointer-events-none">
                            {beforeLabel}
                        </div>
                    )}
                </div>

                {/* 3. Slider Handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 cursor-ew-resize z-20"
                    style={{ left: `${sliderPosition}%`, backgroundColor: sliderColor }}
                >
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 active:scale-95"
                        style={{ backgroundColor: sliderColor }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-4 h-4", sliderColor === '#ffffff' ? 'text-black' : 'text-white')}>
                            <path d="M9 18l-6-6 6-6" />
                            <path d="M15 6l6 6-6 6" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}
