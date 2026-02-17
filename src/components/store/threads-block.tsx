'use client'

import React, { useEffect, useState } from 'react'
import Threads from '@/components/ui/backgrounds/threads'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ThreadsBlockProps {
    title?: string
    description?: string
    color?: [number, number, number]
    backgroundColor?: string
    amplitude?: number
    distance?: number
    mobileAmplitude?: number
    mobileDistance?: number
    centerX?: number
    enableMouseInteraction?: boolean
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
    // New Props
    fontSizeDesktop?: number
    fontSizeMobile?: number
    titleColor?: string
    descriptionColor?: string
    primaryButtonLabel?: string
    primaryButtonLink?: string
    secondaryButtonLabel?: string
    secondaryButtonLink?: string
}

export function ThreadsBlock({
    title,
    description,
    color = [1, 1, 1], // Default white
    backgroundColor = '#000000',
    amplitude = 1,
    distance = 0,
    mobileAmplitude,
    mobileDistance,
    centerX = 0.5,
    enableMouseInteraction = true,
    paddingYDesktop = 0,
    paddingYMobile = 0,
    isMobile: propIsMobile = false,
    fontSizeDesktop = 60,
    fontSizeMobile = 36,
    titleColor = '#ffffff',
    descriptionColor = '#a1a1aa', // zinc-400
    primaryButtonLabel,
    primaryButtonLink,
    secondaryButtonLabel,
    secondaryButtonLink
}: ThreadsBlockProps) {
    const [isMobileView, setIsMobileView] = useState(propIsMobile)

    useEffect(() => {
        // Update state if prop changes (e.g. editor preview mode switch)
        setIsMobileView(propIsMobile)
    }, [propIsMobile])

    useEffect(() => {
        // If not explicitly forced by prop (editor), check window size
        const checkMobile = () => {
            // Only check if we are not in an enforced mobile preview context (or to support live site)
            if (!propIsMobile) {
                const isSmallScreen = window.matchMedia('(max-width: 768px)').matches
                setIsMobileView(isSmallScreen)
            }
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [propIsMobile])

    // Determine effective values based on device type
    // Use the derived isMobileView state
    const isEffectiveMobile = isMobileView

    // Explicitly fallback to desktop values only if mobile values are undefined
    const effectiveAmplitude = (isEffectiveMobile && mobileAmplitude !== undefined) ? mobileAmplitude : amplitude
    const effectiveDistance = (isEffectiveMobile && mobileDistance !== undefined) ? mobileDistance : distance
    const effectiveFontSize = isEffectiveMobile ? fontSizeMobile : fontSizeDesktop

    const paddingY = isEffectiveMobile ? paddingYMobile : paddingYDesktop

    return (
        <section
            className="w-full relative overflow-hidden flex items-center justify-center transition-all duration-300"
            style={{
                backgroundColor: backgroundColor,
                paddingTop: `${paddingY}px`,
                paddingBottom: `${paddingY}px`,
                minHeight: isEffectiveMobile ? '400px' : '600px'
            }}
        >
            <div className="absolute inset-0 z-0">
                <Threads
                    color={color}
                    amplitude={effectiveAmplitude}
                    distance={effectiveDistance}
                    centerX={centerX}
                    enableMouseInteraction={enableMouseInteraction}
                />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pointer-events-none">
                {title && (
                    <h2
                        className="font-display font-bold mb-6 tracking-tight"
                        style={{
                            color: titleColor,
                            fontSize: `${effectiveFontSize}px`,
                            lineHeight: 1.1
                        }}
                    >
                        {title}
                    </h2>
                )}
                {description && (
                    <p
                        className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8"
                        style={{ color: descriptionColor }}
                    >
                        {description}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto">
                    {primaryButtonLabel && (
                        <Button asChild size="lg" className="rounded-full px-8">
                            <Link href={primaryButtonLink || '#'}>
                                {primaryButtonLabel}
                            </Link>
                        </Button>
                    )}
                    {secondaryButtonLabel && (
                        <Button asChild size="lg" variant="outline" className="rounded-full px-8 bg-transparent hover:bg-white/10" style={{ color: titleColor, borderColor: titleColor }}>
                            <Link href={secondaryButtonLink || '#'}>
                                {secondaryButtonLabel}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </section>
    )
}
