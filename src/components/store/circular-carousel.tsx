'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface CircularCarouselProps {
    images: {
        url: string
        alt?: string
        link?: string
    }[]
    autoRotate?: boolean
    radius?: number
    height?: number
    itemWidth?: number
    itemHeight?: number
}

export function CircularCarousel({
    images = [],
    autoRotate = true,
    radius = 300,
    height = 400,
    itemWidth = 200,
    itemHeight = 300
}: CircularCarouselProps) {
    const [rotation, setRotation] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [startRotation, setStartRotation] = useState(0)
    const animationRef = useRef<number | null>(null)

    const count = images.length
    const anglePerItem = 360 / count

    // Auto rotation
    useEffect(() => {
        if (!autoRotate || isDragging || count === 0) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
                animationRef.current = null
            }
            return
        }

        const animate = () => {
            setRotation(prev => prev - 0.2) // Adjust speed here
            animationRef.current = requestAnimationFrame(animate)
        }
        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [autoRotate, isDragging, count])

    // Dragging handlers
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true)
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
        setStartX(clientX)
        setStartRotation(rotation)
    }

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
        const diff = clientX - startX
        setRotation(startRotation + diff * 0.5)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            window.addEventListener('touchmove', handleMouseMove)
            window.addEventListener('touchend', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('touchmove', handleMouseMove)
            window.removeEventListener('touchend', handleMouseUp)
        }
    }, [isDragging, startX, startRotation])

    if (count === 0) return null

    return (
        <div
            className="relative w-full overflow-hidden perspective-1000"
            style={{ height: `${height}px` }}
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            <div
                className="absolute top-1/2 left-1/2 w-full h-full preserve-3d transition-transform duration-0 ease-linear cursor-grab active:cursor-grabbing"
                style={{
                    transform: `translate(-50%, -50%) rotateY(${rotation}deg)`,
                    transformStyle: 'preserve-3d'
                }}
            >
                {images.map((img, index) => {
                    const angle = index * anglePerItem
                    return (
                        <div
                            key={index}
                            className="absolute top-1/2 left-1/2 backface-hidden"
                            style={{
                                width: `${itemWidth}px`,
                                height: `${itemHeight}px`,
                                transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`,
                            }}
                        >
                            <ContentWrapper link={img.link}>
                                <div className="w-full h-full relative rounded-xl overflow-hidden shadow-xl border-2 border-white/20 transition-transform hover:scale-105">
                                    <img
                                        src={img.url}
                                        alt={img.alt || ''}
                                        className="w-full h-full object-cover pointer-events-none" // prevent dragging image
                                    />
                                    <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
                                </div>
                            </ContentWrapper>
                        </div>
                    )
                })}
            </div>

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    /* For double sided, we might want visible, but usually images are single sided */
                    backface-visibility: visible; 
                }
            `}</style>
        </div>
    )
}

function ContentWrapper({ link, children }: { link?: string; children: React.ReactNode }) {
    if (link) {
        return (
            <Link href={link} className="block w-full h-full" onClick={(e) => e.stopPropagation()}>
                {children}
            </Link>
        )
    }
    return <div className="w-full h-full">{children}</div>
}
