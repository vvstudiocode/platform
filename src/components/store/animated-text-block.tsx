'use client'

import { useEffect, useRef, useState, useMemo } from 'react'

interface AnimatedTextBlockProps {
    text: string
    fontSizeDesktop?: number  // in vw
    fontSizeMobile?: number   // in vw
    fontWeight?: number
    textColor?: string
    backgroundColor?: string
    animationType?: 'fade-in' | 'slide-up' | 'split-chars' | 'wave' | 'typewriter'
    animationDuration?: number
    animationDelay?: number
    animationKey?: number  // Change this to replay animation
    textAlign?: 'left' | 'center' | 'right'
    fullWidth?: boolean
    height?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    className?: string
}

export function AnimatedTextBlock({
    text = 'Your Text Here',
    fontSizeDesktop = 8,
    fontSizeMobile = 10,
    fontWeight = 900,
    textColor = '#1C1C1C',
    backgroundColor = '#FED75A',
    animationType = 'split-chars',
    animationDuration = 1,
    animationDelay = 0.05,
    animationKey,
    textAlign = 'center',
    fullWidth = true,
    height = 'auto',
    paddingYDesktop = 64,
    paddingYMobile = 32,
    className = ''
}: AnimatedTextBlockProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [hasAnimated, setHasAnimated] = useState(false)

    // Seeded pseudo-random function for consistent SSR/client values
    const seededRandom = (seed: number) => {
        const x = Math.sin(seed * 9999) * 10000
        return x - Math.floor(x)
    }

    // Generate stable random values for split-chars animation using seeded random
    const randomValues = useMemo(() => {
        return text.split('').map((_, index) => {
            const seed = index + (animationKey || 0)
            // Round values to avoid hydration mismatch due to floating point precision
            const direction = seededRandom(seed) > 0.5 ? -1 : 1
            const offset = parseFloat((50 + seededRandom(seed + 1) * 50).toFixed(4))
            const rotation = parseFloat(((seededRandom(seed + 2) - 0.5) * 30).toFixed(4))

            return { direction, offset, rotation }
        })
    }, [text, animationKey])



    // Intersection Observer for triggering animation on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setIsVisible(true)
                        setHasAnimated(true)
                    }
                })
            },
            { threshold: 0.3 }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [hasAnimated])

    // Split text into lines, then characters (support newlines)
    const lines = text.split('\n')

    // Flatten characters with line info for animation delay calculation
    let charIndex = 0

    // Generate animation styles based on type
    const getCharStyle = (globalIndex: number) => {
        const delay = animationDelay * globalIndex
        const rand = randomValues[globalIndex] || { direction: 1, offset: 50, rotation: 0 }

        if (!isVisible) {
            switch (animationType) {
                case 'fade-in':
                    return {
                        opacity: 0,
                        transition: `opacity ${animationDuration}s ease-out ${delay}s`
                    }
                case 'slide-up':
                    return {
                        opacity: 0,
                        transform: 'translateY(100%)',
                        transition: `all ${animationDuration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
                    }
                case 'split-chars':
                    return {
                        opacity: 0,
                        transform: `translateY(${rand.direction * rand.offset}px) rotate(${rand.rotation}deg) scale(0)`,
                        transition: `all ${animationDuration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
                    }
                case 'wave':
                    return {
                        opacity: 0,
                        transform: 'translateY(30px)',
                        transition: `all ${animationDuration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
                    }
                case 'typewriter':
                    return {
                        opacity: 0,
                        transition: `opacity 0.1s ease ${delay}s`
                    }
                default:
                    return {}
            }
        }

        // Visible state
        return {
            opacity: 1,
            transform: 'translateY(0) rotate(0) scale(1)',
            transition: animationType === 'typewriter'
                ? `opacity 0.1s ease ${delay}s`
                : `all ${animationDuration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
        }
    }

    return (
        <div
            ref={containerRef}
            className={`animated-text-container ${className}`}
            style={{
                width: fullWidth ? '100%' : 'auto',
                minHeight: height !== 'auto' ? height : undefined,
                backgroundColor,
                containerType: 'inline-size',
                position: 'relative'
            }}
        >
            <style jsx>{`
                .animated-text-line {
                    font-size: clamp(1.5rem, ${fontSizeDesktop}cqw, 10rem);
                }
                .animated-text-content {
                    padding-left: clamp(2rem, 5cqw, 4rem);
                    padding-right: clamp(2rem, 5cqw, 4rem);
                    padding-top: ${paddingYDesktop}px;
                    padding-bottom: ${paddingYDesktop}px;
                }
                @container (max-width: 768px) {
                    .animated-text-line {
                        font-size: clamp(1rem, ${fontSizeMobile}cqw, 6rem);
                    }
                    .animated-text-content {
                        padding-top: ${paddingYMobile}px !important;
                        padding-bottom: ${paddingYMobile}px !important;
                    }
                }
            `}</style>

            <div
                className="animated-text-content"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box'
                }}
            >
                <div
                    style={{
                        fontWeight,
                        color: textColor,
                        textAlign,
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em',
                        width: '100%',
                        maxWidth: '100%'
                    }}
                >
                    {lines.map((line, lineIndex) => {
                        const chars = line.split('')
                        const lineStartIndex = charIndex
                        charIndex += chars.length

                        return (
                            <div
                                key={lineIndex}
                                className="animated-text-line"
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
                                    marginBottom: lineIndex < lines.length - 1 ? '0.2em' : 0
                                }}
                            >
                                {chars.map((char, charIdx) => {
                                    const globalIdx = lineStartIndex + charIdx
                                    return (
                                        <span
                                            key={charIdx}
                                            style={{
                                                display: 'inline-block',
                                                whiteSpace: char === ' ' ? 'pre' : 'normal',
                                                ...getCharStyle(globalIdx)
                                            }}
                                        >
                                            {char === ' ' ? '\u00A0' : char}
                                        </span>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
