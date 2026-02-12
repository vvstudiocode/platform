"use client"

import { cn } from "@/lib/utils"
import React, { useEffect, useRef, useState } from "react"

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * The content to be scrolled. Can be text or React nodes.
     */
    children: React.ReactNode
    /**
     * Direction of the scroll.
     * @default "left"
     */
    direction?: "left" | "right"
    /**
     * Speed of the scroll in pixels per second.
     * @default 20
     */
    speed?: number
    /**
     * Whether to pause the animation on hover.
     * @default true
     */
    pauseOnHover?: boolean
    /**
     * Gap between repeated content in pixels.
     * @default 0
     */
    gap?: number
}

export function Marquee({
    children,
    direction = "left",
    speed = 20,
    pauseOnHover = true,
    gap = 0,
    className,
    ...props
}: MarqueeProps) {
    const [containerWidth, setContainerWidth] = useState(0)
    const [contentWidth, setContentWidth] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const updateWidths = () => {
            if (containerRef.current && contentRef.current) {
                setContainerWidth(containerRef.current.offsetWidth)
                setContentWidth(contentRef.current.offsetWidth)
            }
        }

        updateWidths()
        window.addEventListener("resize", updateWidths)
        return () => window.removeEventListener("resize", updateWidths)
    }, [children])

    // Calculate how many copies we need to fill the screen plus a buffer
    // We need enough copies to ensure that when the first copy scrolls out, the next one is ready
    const copies = contentWidth > 0 ? Math.ceil(containerWidth / contentWidth) + 1 : 2

    // Create an array of indices for rendering copies
    const iterations = Array.from({ length: Math.max(copies, 2) }, (_, i) => i)

    return (
        <div
            ref={containerRef}
            className={cn("overflow-hidden whitespace-nowrap", className)}
            {...props}
        >
            <div
                className={cn(
                    "flex w-max",
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
                style={{
                    gap: `${gap}px`,
                    animation: `marquee-${direction} ${contentWidth / speed}s linear infinite`,
                }}
            >
                {iterations.map((i) => (
                    <div key={i} ref={i === 0 ? contentRef : undefined} className="flex-shrink-0">
                        {children}
                    </div>
                ))}
            </div>
            <style jsx>{`
        @keyframes marquee-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% - ${gap}px));
          }
        }
        @keyframes marquee-right {
          0% {
            transform: translateX(calc(-100% - ${gap}px));
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
        </div>
    )
}
