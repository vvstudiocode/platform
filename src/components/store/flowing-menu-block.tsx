'use client'

import FlowingMenu from '@/components/ui/flowing-menu'

interface MenuItem {
    link: string
    text: string
    image: string
}

interface FlowingMenuBlockProps {
    items?: MenuItem[]
    speed?: number
    textColor?: string
    bgColor?: string
    marqueeBgColor?: string
    marqueeTextColor?: string
    borderColor?: string
    height?: number
    paddingYDesktop?: number
    paddingYMobile?: number
}

export function FlowingMenuBlock({
    items = [],
    speed = 15,
    textColor = '#ffffff',
    bgColor = '#060010',
    marqueeBgColor = '#ffffff',
    marqueeTextColor = '#060010',
    borderColor = '#ffffff',
    height = 600,
    paddingYDesktop = 0,
    paddingYMobile = 0
}: FlowingMenuBlockProps) {
    return (
        <div className="w-full">
            {/* Desktop padding */}
            <div
                className="hidden md:block w-full"
                style={{
                    paddingTop: `${paddingYDesktop}px`,
                    paddingBottom: `${paddingYDesktop}px`
                }}
            >
                <div style={{ height: `${height}px`, position: 'relative' }}>
                    <FlowingMenu
                        items={items}
                        speed={speed}
                        textColor={textColor}
                        bgColor={bgColor}
                        marqueeBgColor={marqueeBgColor}
                        marqueeTextColor={marqueeTextColor}
                        borderColor={borderColor}
                    />
                </div>
            </div>

            {/* Mobile padding */}
            <div
                className="md:hidden w-full"
                style={{
                    paddingTop: `${paddingYMobile}px`,
                    paddingBottom: `${paddingYMobile}px`
                }}
            >
                <div style={{ height: `${height}px`, position: 'relative' }}>
                    <FlowingMenu
                        items={items}
                        speed={speed}
                        textColor={textColor}
                        bgColor={bgColor}
                        marqueeBgColor={marqueeBgColor}
                        marqueeTextColor={marqueeTextColor}
                        borderColor={borderColor}
                    />
                </div>
            </div>
        </div>
    )
}
