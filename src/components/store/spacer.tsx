
'use client'

import { cn } from "@/lib/utils"

interface SpacerProps {
    heightDesktop?: number
    heightMobile?: number
    backgroundColor?: string
    isMobile?: boolean
}

export function Spacer({
    heightDesktop = 50,
    heightMobile = 30,
    backgroundColor = 'transparent',
    isMobile = false
}: SpacerProps) {
    const height = isMobile ? heightMobile : heightDesktop

    // 如果高度為 0,則不渲染任何內容
    if (height === 0) {
        return null
    }

    // 確保最小高度為 1px
    const actualHeight = Math.max(1, height)

    return (
        <div
            className="w-full transition-all duration-300"
            style={{
                height: actualHeight,
                backgroundColor: backgroundColor
            }}
        />
    )
}
