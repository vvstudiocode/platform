"use client"

import { Marquee } from "@/components/ui/marquee"

interface MarqueeBlockProps {
    text?: string
    speed?: number
    direction?: "left" | "right"
    pauseOnHover?: boolean
    backgroundColor?: string
    textColor?: string
    paddingY?: number // Legacy prop support if needed, but we used paddingYDesktop/Mobile in renderer
    fontSize?: number
}

export function MarqueeBlock({
    text = "WELCOME TO OUR STORE",
    speed = 30,
    direction = "left",
    pauseOnHover = true,
    backgroundColor = "#000000",
    textColor = "#FFFFFF",
    fontSize = 16,
}: MarqueeBlockProps) {
    return (
        <div
            className="w-full overflow-hidden"
            style={{ backgroundColor }}
        >
            <Marquee
                speed={speed}
                direction={direction}
                pauseOnHover={pauseOnHover}
                className="py-2"
            >
                <span
                    className="font-bold mx-4"
                    style={{
                        color: textColor,
                        fontSize: `${fontSize}px`
                    }}
                >
                    {text}
                </span>
                {/* Repeat content a few times to ensure smooth loop if text is short */}
                <span
                    className="font-bold mx-4"
                    style={{
                        color: textColor,
                        fontSize: `${fontSize}px`
                    }}
                >
                    {text}
                </span>
                <span
                    className="font-bold mx-4"
                    style={{
                        color: textColor,
                        fontSize: `${fontSize}px`
                    }}
                >
                    {text}
                </span>
            </Marquee>
        </div>
    )
}
