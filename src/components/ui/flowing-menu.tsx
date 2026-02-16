'use client'

import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'

interface MenuItemData {
    link: string
    text: string
    image: string
}

interface FlowingMenuProps {
    items?: MenuItemData[]
    speed?: number
    textColor?: string
    bgColor?: string
    marqueeBgColor?: string
    marqueeTextColor?: string
    borderColor?: string
}

interface MenuItemProps extends MenuItemData {
    speed: number
    textColor: string
    marqueeBgColor: string
    marqueeTextColor: string
    borderColor: string
    isFirst: boolean
}

const FlowingMenu: React.FC<FlowingMenuProps> = ({
    items = [],
    speed = 15,
    textColor = '#fff',
    bgColor = '#060010',
    marqueeBgColor = '#fff',
    marqueeTextColor = '#060010',
    borderColor = '#fff'
}) => {
    const [isMobile, setIsMobile] = useState(false)
    const [activeItem, setActiveItem] = useState<number | null>(null)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(max-width: 768px)').matches)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    if (items.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bgColor, minHeight: '400px' }}>
                <p style={{ color: textColor }} className="text-lg">請在編輯器中新增選單項目</p>
            </div>
        )
    }

    return (
        <div className="w-full h-full overflow-hidden" style={{ backgroundColor: bgColor, minHeight: '400px' }}>
            <nav className="flex flex-col h-full m-0 p-0">
                {items.map((item, idx) => (
                    <MenuItem
                        key={idx}
                        {...item}
                        speed={speed}
                        textColor={textColor}
                        marqueeBgColor={marqueeBgColor}
                        marqueeTextColor={marqueeTextColor}
                        borderColor={borderColor}
                        isFirst={idx === 0}
                        isMobile={isMobile}
                        isActive={activeItem === idx}
                        setActive={() => setActiveItem(idx)}
                    />
                ))}
            </nav>
        </div>
    )
}

interface MenuItemExtendedProps extends MenuItemProps {
    isMobile: boolean
    isActive: boolean
    setActive: () => void
}

const MenuItem: React.FC<MenuItemExtendedProps> = ({
    link,
    text,
    image,
    speed,
    textColor,
    marqueeBgColor,
    marqueeTextColor,
    borderColor,
    isFirst,
    isMobile,
    isActive,
    setActive
}) => {
    const itemRef = useRef<HTMLDivElement>(null)
    const marqueeRef = useRef<HTMLDivElement>(null)
    const marqueeInnerRef = useRef<HTMLDivElement>(null)
    const animationRef = useRef<gsap.core.Tween | null>(null)
    const [repetitions, setRepetitions] = useState(4)

    const animationDefaults = { duration: 0.6, ease: 'expo' }

    const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number): 'top' | 'bottom' => {
        const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2)
        const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2)
        return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom'
    }

    useEffect(() => {
        const calculateRepetitions = () => {
            if (!marqueeInnerRef.current) return
            const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part') as HTMLElement
            if (!marqueeContent) return
            const contentWidth = marqueeContent.offsetWidth
            const viewportWidth = window.innerWidth

            // 安全檢查:確保 contentWidth 有效
            if (!contentWidth || contentWidth <= 0) {
                setRepetitions(4)
                return
            }

            const needed = Math.ceil(viewportWidth / contentWidth) + 2
            // 確保 repetitions 是有效的正整數,最小為 4
            setRepetitions(Math.max(4, Math.min(needed, 50))) // 同時設定最大值避免過多重複
        }

        calculateRepetitions()
        window.addEventListener('resize', calculateRepetitions)
        return () => window.removeEventListener('resize', calculateRepetitions)
    }, [text, image])

    useEffect(() => {
        const setupMarquee = () => {
            if (!marqueeInnerRef.current) return
            const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part') as HTMLElement
            if (!marqueeContent) return
            const contentWidth = marqueeContent.offsetWidth
            if (contentWidth === 0) return

            if (animationRef.current) {
                animationRef.current.kill()
            }

            animationRef.current = gsap.to(marqueeInnerRef.current, {
                x: -contentWidth,
                duration: speed,
                ease: 'none',
                repeat: -1
            })
        }

        const timer = setTimeout(setupMarquee, 50)
        return () => {
            clearTimeout(timer)
            if (animationRef.current) {
                animationRef.current.kill()
            }
        }
    }, [text, image, repetitions, speed])

    // Handle hover animations (Desktop) and click-triggered animations (Mobile)
    useEffect(() => {
        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return

        // If mobile and active, simulate "MouseEnter" animation
        if (isMobile && isActive) {
            gsap
                .timeline({ defaults: animationDefaults })
                .set(marqueeRef.current, { y: '-101%' }, 0) // Always come from top for simplicity on mobile
                .set(marqueeInnerRef.current, { y: '101%' }, 0)
                .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0)
        }
        // If mobile and NOT active (but was previous active, or just default state), hide it
        else if (isMobile && !isActive) {
            gsap
                .timeline({ defaults: animationDefaults })
                .to(marqueeRef.current, { y: '-101%' }, 0)
                .to(marqueeInnerRef.current, { y: '101%' }, 0)
        }
    }, [isMobile, isActive])


    const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        if (isMobile) return // Disable hover on mobile

        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return
        const rect = itemRef.current.getBoundingClientRect()
        const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height)

        gsap
            .timeline({ defaults: animationDefaults })
            .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
            .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
            .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0)
    }

    const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        if (isMobile) return // Disable hover on mobile

        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return
        const rect = itemRef.current.getBoundingClientRect()
        const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height)

        gsap
            .timeline({ defaults: animationDefaults })
            .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
            .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isMobile) {
            if (!isActive) {
                // First tap: Activate (Simulate Hover)
                e.preventDefault()
                setActive()
            }
            // Second tap (isActive is true): Allow default link navigation
        }
    }

    return (
        <div
            className="flex-1 relative overflow-hidden text-center"
            ref={itemRef}
            style={{ borderTop: isFirst ? 'none' : `1px solid ${borderColor}` }}
        >
            <a
                className="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-semibold text-[4vh]"
                href={link}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                style={{ color: textColor }}
            >
                {text}
            </a>
            <div
                className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
                ref={marqueeRef}
                style={{ backgroundColor: marqueeBgColor }}
            >
                <div className="h-full w-fit flex" ref={marqueeInnerRef}>
                    {[...Array(Math.max(1, Math.floor(repetitions)))].map((_, idx) => (
                        <div className="marquee-part flex items-center flex-shrink-0" key={idx} style={{ color: marqueeTextColor }}>
                            <span className="whitespace-nowrap uppercase font-normal text-[4vh] leading-[1] px-[1vw]">{text}</span>
                            <div
                                className="w-[200px] h-[7vh] my-[2em] mx-[2vw] py-[1em] rounded-[50px] bg-cover bg-center"
                                style={{ backgroundImage: `url(${image})` }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FlowingMenu
