'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Star, Image as ImageIcon, Play } from 'lucide-react'

interface TestimonialShowcaseProps {
    sectionTitle?: string
    headerButtonText?: string
    headerButtonUrl?: string

    // User Info
    userName?: string
    userRole?: string
    userAvatar?: string
    rating?: number // 1-5

    // Content
    quoteTitle?: string
    quote?: string

    // Gallery (Right side)
    image1?: string
    image2?: string
    image2Text?: string

    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
    backgroundColor?: string
}

export function TestimonialShowcase({
    sectionTitle = "Highlights",
    headerButtonText,
    headerButtonUrl,
    userName = "Maria Angelica",
    userRole = "Traveler",
    userAvatar,
    rating = 5,
    quoteTitle = "An Unforgettable Journey",
    quote = "Thanks to the team, my trip was truly magical. Their expert guides and insider tips led me to hidden gems and must-see spots I would have missed otherwise.",
    image1,
    image2,
    image2Text,
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false,
    backgroundColor
}: TestimonialShowcaseProps) {

    return (
        <section
            className={cn(
                "w-full overflow-hidden",
                isMobile ? "" : "py-[var(--py-mobile)] md:py-[var(--py-desktop)]"
            )}
            style={{
                backgroundColor: backgroundColor || '#ffffff',
                paddingTop: isMobile ? `${paddingYMobile}px` : undefined,
                paddingBottom: isMobile ? `${paddingYMobile}px` : undefined,
                '--py-desktop': `${paddingYDesktop}px`,
                '--py-mobile': `${paddingYMobile}px`,
            } as any}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">{sectionTitle}</h2>
                    {headerButtonText && (
                        <Link
                            href={headerButtonUrl || '#'}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                        >
                            {headerButtonText}
                        </Link>
                    )}
                </div>

                <div className={`grid gap-12 items-center ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
                    {/* Left: Testimonial */}
                    <div className={isMobile ? 'pr-0 max-w-lg mx-auto' : 'pr-0 lg:pr-12'}>
                        {userAvatar && (
                            <>
                                <div className="flex items-center mb-6">
                                    <div className="h-12 w-12 rounded-full bg-gray-300 overflow-hidden mr-4">
                                        <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-gray-900">{userName}</h4>
                                        <p className="text-sm text-gray-500">{userRole}</p>
                                    </div>
                                </div>

                                <div className="flex text-yellow-500 mb-4 space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 fill-current ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{quoteTitle}</h3>
                        <p className="text-gray-600 leading-relaxed italic">
                            "{quote}"
                        </p>
                    </div>

                    {/* Right: Gallery */}
                    <div className={`grid grid-cols-2 gap-4 ${isMobile ? 'h-64' : 'h-64 sm:h-80'}`}>
                        {image1 && (
                            <div className="h-full rounded-2xl overflow-hidden relative group">
                                <img
                                    src={image1}
                                    alt="Highlight 1"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute bottom-4 left-4">
                                    <ImageIcon className="text-white drop-shadow-md w-6 h-6" />
                                </div>
                            </div>
                        )}

                        {image2 && (
                            <div className="h-full rounded-2xl overflow-hidden relative group cursor-pointer">
                                <img
                                    src={image2}
                                    alt="Highlight 2"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-75 group-hover:brightness-90"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-14 w-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                                        <Play className="text-white w-8 h-8 ml-1 fill-white" />
                                    </div>
                                </div>
                                {image2Text && (
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <p className="text-white text-sm font-medium truncate">{image2Text}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
