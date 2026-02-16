"use client"

import LogoLoop, { LogoItem } from "@/components/ui/logo-loop"

interface ImageMarqueeBlockProps {
    images?: Array<{ url: string; alt?: string; link?: string }>
    speed?: number
    direction?: "left" | "right" | "up" | "down"
    pauseOnHover?: boolean
    backgroundColor?: string
    imageHeight?: number
    imageGap?: number
    fadeOut?: boolean
    scaleOnHover?: boolean
    paddingYDesktop?: number
    paddingYMobile?: number
}

export function ImageMarqueeBlock({
    images = [],
    speed = 30,
    direction = "left",
    pauseOnHover = true,
    backgroundColor = "#ffffff",
    imageHeight = 100,
    imageGap = 32,
    fadeOut = false,
    scaleOnHover = false,
    paddingYDesktop = 64,
    paddingYMobile = 32
}: ImageMarqueeBlockProps) {
    const validImages = images.filter((img) => img.url && img.url.trim() !== "")

    if (!validImages || validImages.length === 0) return null

    // 轉換圖片格式為 LogoItem
    const logoItems: LogoItem[] = validImages.map((img) => ({
        src: img.url,
        alt: img.alt || "",
        href: img.link,
        title: img.alt
    }))

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
                <LogoLoop
                    logos={logoItems}
                    speed={speed}
                    direction={direction}
                    logoHeight={imageHeight}
                    gap={imageGap}
                    pauseOnHover={pauseOnHover}
                    fadeOut={fadeOut}
                    fadeOutColor={backgroundColor}
                    scaleOnHover={scaleOnHover}
                    ariaLabel="圖片輪播"
                />
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
                <LogoLoop
                    logos={logoItems}
                    speed={speed}
                    direction={direction}
                    logoHeight={imageHeight}
                    gap={imageGap}
                    pauseOnHover={pauseOnHover}
                    fadeOut={fadeOut}
                    fadeOutColor={backgroundColor}
                    scaleOnHover={scaleOnHover}
                    ariaLabel="圖片輪播"
                />
            </div>
        </>
    )
}
