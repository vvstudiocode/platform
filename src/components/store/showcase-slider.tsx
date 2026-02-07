"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ShowcaseSlide {
    image: string
    title: string
    subtitle?: string
    buttonText?: string
    link?: string
    buttonColor?: string
    buttonHoverColor?: string
    buttonTextColor?: string
    buttonTextHoverColor?: string
    textColor?: string
}

interface ShowcaseSliderProps {
    slides: ShowcaseSlide[]
    autoplay?: boolean
    interval?: number
    height?: string
    fullWidth?: boolean
    paddingYDesktop?: number
    paddingYMobile?: number
    buttonHoverColor?: string
    className?: string
}

export function ShowcaseSlider({
    slides = [],
    autoplay = true,
    interval = 5000,
    height = "100vh", // Default to full screen
    fullWidth = true,
    paddingYDesktop = 0,
    paddingYMobile = 0,
    buttonHoverColor,
    className,
}: ShowcaseSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState<'next' | 'prev'>('next')
    const [isAnimating, setIsAnimating] = useState(false)
    const timerRef = useRef<NodeJS.Timeout>(null)
    const touchStartX = useRef<number | null>(null)

    // Make sure we have slides
    const safeSlides = slides.length > 0 ? slides : [
        {
            image: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?q=80&w=3270&auto=format&fit=crop",
            title: "Demonstrate Value",
            subtitle: "Premium Design Quality",
            buttonText: "Learn More",
            link: "#"
        }
    ]

    const nextSlide = () => {
        if (isAnimating) return
        setDirection('next')
        setIsAnimating(true)
        setCurrentIndex((prev) => (prev + 1) % safeSlides.length)
    }

    const prevSlide = () => {
        if (isAnimating) return
        setDirection('prev')
        setIsAnimating(true)
        setCurrentIndex((prev) => (prev - 1 + safeSlides.length) % safeSlides.length)
    }

    const goToSlide = (index: number) => {
        if (isAnimating || index === currentIndex) return
        setDirection(index > currentIndex ? 'next' : 'prev')
        setIsAnimating(true)
        setCurrentIndex(index)
    }

    // Auto play
    useEffect(() => {
        if (autoplay && !isAnimating) {
            timerRef.current = setTimeout(nextSlide, interval)
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [currentIndex, autoplay, interval, isAnimating])

    // Reset animation state
    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(() => setIsAnimating(false), 1000) // Match CSS transition duration
            return () => clearTimeout(timer)
        }
    }, [isAnimating])

    // Touch support (Swipe)
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartX.current) return
        const touchEndX = e.changedTouches[0].clientX
        const diff = touchStartX.current - touchEndX

        if (Math.abs(diff) > 50) { // Threshold
            if (diff > 0) nextSlide()
            else prevSlide()
        }
        touchStartX.current = null
    }

    const currentSlide = safeSlides[currentIndex]

    // Previous slide for exit animation (not strictly needed for specific transition style, but good for context)
    const prevIndex = direction === 'next'
        ? (currentIndex - 1 + safeSlides.length) % safeSlides.length
        : (currentIndex + 1) % safeSlides.length

    const hoverColor = buttonHoverColor || "#e11d48" // Default rose-600

    return (
        <div className={cn("w-full relative", className)}>
            <div
                className={cn(
                    "relative overflow-hidden group select-none bg-black",
                    // Force full width as requested
                    "w-full"
                )}
                style={{
                    height,
                    // If user wants component "distance", usually means margin or padding on the SECTION. 
                    // But if it's full screen, padding just shrinks the view? 
                    // Let's assume margin-like behavior or padding on the wrapper.
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Spacing wrapper if needed, or just apply style to main div */}
                {/* Logic: distinct padding for desktop/mobile is usually applied to the SECTION wrapper in standard components. 
                    Here we are the component. Let's apply standard Tailwind classes for padding if provided, or style. 
                   Since we receive number values from SpacingControls (px), apply them.
                */}
                <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                />

                {safeSlides.map((slide, index) => {
                    const isActive = index === currentIndex

                    return (
                        <div
                            key={index}
                            className={cn(
                                "absolute inset-0 w-full h-full transition-all duration-[1200ms] ease-out",
                                isActive ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105",
                                !isActive && "pointer-events-none"
                            )}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div
                                    className={cn(
                                        "absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] ease-out",
                                        isActive ? "scale-100" : "scale-110"
                                    )}
                                    style={{ backgroundImage: `url(${slide.image})` }}
                                />
                                <div className="absolute inset-0 bg-black/40" />
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 flex items-center justify-center text-center p-6 md:p-20">
                                <div className="max-w-4xl space-y-4 md:space-y-8">
                                    {/* Subtitle - adjusted mobile size */}
                                    {slide.subtitle && (
                                        <div className="overflow-hidden">
                                            <p className={cn(
                                                "text-[10px] md:text-lg font-medium tracking-[0.2em] text-white/80 uppercase transition-all duration-1000 delay-300",
                                                isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                                            )}>
                                                {slide.subtitle}
                                            </p>
                                        </div>
                                    )}

                                    {/* Title - adjusted mobile size */}
                                    <div className="overflow-hidden">
                                        <h2 className={cn(
                                            "text-2xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-tight transition-all duration-1000 delay-500",
                                            "drop-shadow-lg",
                                            isActive ? "translate-y-0 opacity-100 blur-0" : "translate-y-20 opacity-0 blur-sm"
                                        )}>
                                            {slide.title}
                                        </h2>
                                    </div>

                                    {/* Button - adjusted mobile size and color */}
                                    {slide.buttonText && (
                                        <div className={cn(
                                            "pt-2 md:pt-4 transition-all duration-1000 delay-700",
                                            isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                                        )}>
                                            {(() => {
                                                const btnClass = "inline-flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-4 bg-white text-black text-[10px] md:text-base font-bold tracking-widest uppercase transition-colors duration-300 group/btn"

                                                // Dynamic style for hover is tricky with inline styles in React without state/CSS variables.
                                                // Using a CSS variable for hover color.
                                                const btnStyle = {
                                                    '--hover-bg': hoverColor,
                                                } as React.CSSProperties

                                                const content = (
                                                    <>
                                                        {slide.buttonText}
                                                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                                                    </>
                                                )

                                                if (slide.link) {
                                                    return (
                                                        <Link href={slide.link} className={btnClass} style={btnStyle}>
                                                            {content}
                                                        </Link>
                                                    )
                                                }
                                                return (
                                                    <button className={btnClass} style={btnStyle}>
                                                        {content}
                                                    </button>
                                                )
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}

                {/* Pagination Dots */}
                <div className="absolute bottom-6 md:bottom-8 right-0 left-0 md:left-auto md:right-8 z-20 flex justify-center md:flex-col gap-3 md:gap-4 md:top-1/2 md:-translate-y-1/2 md:bottom-auto">
                    {safeSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "group flex items-center gap-4 transition-all duration-300",
                                index === currentIndex ? "opacity-100" : "opacity-40 hover:opacity-100"
                            )}
                        >
                            {/* Desktop: Number + Line */}
                            <span className="hidden md:block text-xs font-bold text-white tracking-widest">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className={cn(
                                "h-[2px] bg-white transition-all duration-300",
                                // Mobile style (dots) vs Desktop style (lines)
                                "w-2 h-2 rounded-full md:w-12 md:h-[2px] md:rounded-none",
                                index === currentIndex ? "bg-white scale-100" : "bg-white/50 md:scale-x-50 group-hover:md:scale-x-75"
                            )} />
                        </button>
                    ))}
                </div>

                {/* Progress Bar (Autoplay) */}
                {autoplay && (
                    <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full z-20">
                        <div
                            key={currentIndex}
                            className="h-full transition-none"
                            style={{
                                width: '100%',
                                backgroundColor: hoverColor,
                                animation: isAnimating ? 'none' : `progress ${interval}ms linear`
                            }}
                        />
                    </div>
                )}

                <style jsx global>{`
                    @keyframes progress {
                        from { width: 0%; }
                        to { width: 100%; }
                    }
                    .group\/btn:hover {
                        background-color: var(--hover-bg) !important;
                        color: white !important;
                    }
                `}</style>
            </div>

            {/* Standard spacing wrapper for "top/bottom distance" */}
            <div
                className="hidden md:block"
                style={{ height: paddingYDesktop ? `${paddingYDesktop}px` : 0 }}
            />
            <div
                className="md:hidden"
                style={{ height: paddingYMobile ? `${paddingYMobile}px` : 0 }}
            />
        </div>
    )
}
