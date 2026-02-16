"use client"

import ImageTrail from "@/components/ui/image-trail"

interface ImageTrailBlockProps {
    images?: string[]
    variant?: number
    height?: number
    backgroundColor?: string
    paddingYDesktop?: number
    paddingYMobile?: number
}

export function ImageTrailBlock({
    images = [],
    variant = 1,
    height = 500,
    backgroundColor = "transparent",
    paddingYDesktop = 0,
    paddingYMobile = 0
}: ImageTrailBlockProps) {
    if (!images || images.length === 0) return null

    return (
        <>
            {/* Desktop version */}
            <div
                className="hidden md:block w-full"
                style={{
                    backgroundColor,
                    paddingTop: `${paddingYDesktop}px`,
                    paddingBottom: `${paddingYDesktop}px`
                }}
            >
                <div style={{ height: `${height}px`, position: 'relative', overflow: 'hidden' }}>
                    <ImageTrail items={images} variant={variant} />
                </div>
            </div>

            {/* Mobile version */}
            <div
                className="md:hidden w-full"
                style={{
                    backgroundColor,
                    paddingTop: `${paddingYMobile}px`,
                    paddingBottom: `${paddingYMobile}px`
                }}
            >
                <div style={{ height: `${height}px`, position: 'relative', overflow: 'hidden' }}>
                    <ImageTrail items={images} variant={variant} />
                </div>
            </div>
        </>
    )
}
