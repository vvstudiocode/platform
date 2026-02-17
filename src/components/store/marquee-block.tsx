"use client"

import LogoLoop, { LogoItem } from "@/components/ui/logo-loop"

interface MarqueeBlockProps {
    text?: string
    speed?: number
    direction?: "left" | "right"
    pauseOnHover?: boolean
    backgroundColor?: string
    textColor?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    fontSize?: number // Legacy
    fontSizeDesktop?: number
    fontSizeMobile?: number
    isMobile?: boolean
}

export function MarqueeBlock({
    text = "WELCOME TO OUR STORE",
    speed = 30,
    direction = "left",
    pauseOnHover = true,
    backgroundColor = "#000000",
    textColor = "#FFFFFF",
    fontSize = 16,
    fontSizeDesktop = 60,
    fontSizeMobile = 36,
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false
}: MarqueeBlockProps) {
    // Determine effective font size for editor preview or initial render
    const currentFontSize = isMobile ? (fontSizeMobile || 36) : (fontSize || fontSizeDesktop || 60)

    const textItems: LogoItem[] = [
        {
            node: (
                <span
                    className="font-bold whitespace-nowrap marquee-text"
                    style={{
                        color: textColor,
                        // Remove inline fontSize to let CSS class handle it via media queries in production,
                        // but keep it for editor preview if needed, or rely on the style block below.
                        // Actually, for LogoLoop node, we might want to use a class that we control via style jsx.
                    }}
                >
                    {text}
                </span>
            )
        }
    ]

    return (
        <div
            className="w-full overflow-hidden marquee-container select-none"
            style={{
                backgroundColor,
                paddingTop: isMobile ? `${paddingYMobile}px` : `${paddingYDesktop}px`,
                paddingBottom: isMobile ? `${paddingYMobile}px` : `${paddingYDesktop}px`
            }}
        >
            {!isMobile && (
                <style jsx>{`
                    @media (max-width: 768px) {
                        .marquee-container {
                            padding-top: ${paddingYMobile}px !important;
                            padding-bottom: ${paddingYMobile}px !important;
                        }
                        :global(.marquee-text) {
                            font-size: ${fontSizeMobile}px !important;
                        }
                    }
                    @media (min-width: 769px) {
                        .marquee-container {
                            padding-top: ${paddingYDesktop}px !important;
                            padding-bottom: ${paddingYDesktop}px !important;
                        }
                        :global(.marquee-text) {
                            font-size: ${fontSize || fontSizeDesktop}px !important;
                        }
                    }
                `}</style>
            )}
            {/* For editor mobile preview, we need to manually inject style if !isMobile block is skipped (which happens if isMobile=true) 
                Wait, if isMobile=true, the style block above is NOT rendered. 
                So we rely on inline styles or another mechanism.
            */}
            {isMobile && (
                <style jsx>{`
                    :global(.marquee-text) {
                        font-size: ${fontSizeMobile}px !important;
                    }
                `}</style>
            )}
            {/* Fallback for desktop editor preview if needed, effectively handled by default or the !isMobile block */}

            <LogoLoop
                logos={textItems}
                speed={speed}
                direction={direction}
                pauseOnHover={false}
                gap={64}
                logoHeight={currentFontSize} // Pass currentFontSize for calculation reference
                ariaLabel={text}
                className="overflow-hidden"
            />
        </div>
    )
}
