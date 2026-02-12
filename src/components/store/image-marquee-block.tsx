"use client"

import { Marquee } from "@/components/ui/marquee"
import Image from "next/image"

interface ImageMarqueeBlockProps {
    images?: Array<{ url: string; alt?: string; link?: string }>
    speed?: number
    direction?: "left" | "right"
    pauseOnHover?: boolean
    backgroundColor?: string
    imageHeight?: number
    imageGap?: number
}

export function ImageMarqueeBlock({
    images = [],
    speed = 30,
    direction = "left",
    pauseOnHover = true,
    backgroundColor = "#ffffff",
    imageHeight = 100,
    imageGap = 32,
}: ImageMarqueeBlockProps) {
    if (!images || images.length === 0) return null

    return (
        <div
            className="w-full overflow-hidden"
            style={{ backgroundColor }}
        >
            <Marquee
                speed={speed}
                direction={direction}
                pauseOnHover={pauseOnHover}
                gap={imageGap}
                className="py-2"
            >
                <div className="flex items-center" style={{ gap: `${imageGap}px` }}>
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="relative flex-shrink-0"
                            style={{ height: `${imageHeight}px` }}
                        >
                            <img
                                src={img.url}
                                alt={img.alt || ""}
                                className="h-full w-auto object-contain transition-all duration-300 hover:scale-105"
                                style={{ maxHeight: '100%' }}
                            />
                        </div>
                    ))}
                </div>
            </Marquee>
        </div>
    )
}
