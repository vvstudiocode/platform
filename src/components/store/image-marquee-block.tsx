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
    const validImages = images.filter((img) => img.url && img.url.trim() !== "")

    if (!validImages || validImages.length === 0) return null

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
                    {validImages.map((img, index) => (
                        <div
                            key={index}
                            className="relative flex-shrink-0 overflow-hidden rounded-lg"
                            style={{
                                height: `${imageHeight}px`,
                                width: `${imageHeight}px`
                            }}
                        >
                            <img
                                src={img.url}
                                alt={img.alt || ""}
                                className="h-full w-full object-cover transition-all duration-300 hover:scale-105"
                                style={{ maxHeight: '100%' }}
                            />
                        </div>
                    ))}
                </div>
            </Marquee>
        </div>
    )
}
