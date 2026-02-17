'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface HeroCompositionProps {
    title?: string
    subtitle?: string
    buttonText?: string
    buttonUrl?: string
    images?: string[]
    description?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
    backgroundColor?: string
    fontSizeDesktop?: number
    fontSizeMobile?: number
}

export function HeroComposition({
    title,
    subtitle,
    buttonText,
    buttonUrl,
    images = [],
    description,
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false,
    backgroundColor,
    fontSizeDesktop = 48,
    fontSizeMobile = 36
}: HeroCompositionProps) {
    // Default placeholders
    const img1 = images[0] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
    const img2 = images[1] || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
    const img3 = images[2] || "https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?q=80&w=1964&auto=format&fit=crop"

    return (
        <section
            className={cn(
                "relative overflow-hidden w-full",
                isMobile ? "" : "py-[var(--py-mobile)] md:py-[var(--py-desktop)]"
            )}
            style={{
                backgroundColor: backgroundColor,
                paddingTop: isMobile ? `${paddingYMobile}px` : undefined,
                paddingBottom: isMobile ? `${paddingYMobile}px` : undefined,
                '--py-desktop': `${paddingYDesktop}px`,
                '--py-mobile': `${paddingYMobile}px`,
                '--title-fs-desktop': `${fontSizeDesktop}px`,
                '--title-fs-mobile': `${fontSizeMobile}px`,
            } as any}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Mobile Layout - 完全垂直排列 */}
                <div className={isMobile ? 'block' : 'block lg:hidden'}>
                    {/* Text Content */}
                    <div className="max-w-2xl mb-12">
                        <h1
                            className="font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]"
                            style={{ fontSize: isMobile ? `var(--title-fs-mobile)` : `var(--title-fs-mobile)` }}
                        >
                            {title || "Discover the World's Hidden Wonders"}
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                            {description || subtitle || "Find the unique moments and hidden gems that ignite unforgettable experiences."}
                        </p>
                        {buttonText && (
                            <div className="mb-12">
                                <Link
                                    href={buttonUrl || '#'}
                                    className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-base font-medium rounded-full hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 shadow-lg active:scale-95"
                                >
                                    {buttonText}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Images */}
                    <div className="relative w-full space-y-6">
                        {/* Main Image */}
                        <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-xl">
                            <img
                                src={img1}
                                alt="Hero Main"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>

                        {/* Secondary Images Grid */}
                        <div className="grid grid-cols-2 gap-4 h-48 sm:h-64">
                            <div className="relative rounded-2xl overflow-hidden shadow-lg">
                                <img
                                    src={img2}
                                    alt="Hero Secondary 1"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="relative rounded-2xl overflow-hidden shadow-lg">
                                <img
                                    src={img3}
                                    alt="Hero Secondary 2"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Layout - 左右分欄 */}
                <div className={isMobile ? 'hidden' : 'hidden lg:grid lg:grid-cols-2 gap-12 items-center'}>
                    {/* Text Content - Left */}
                    <div className="max-w-2xl">
                        <h1
                            className="font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]"
                            style={{ fontSize: `var(--title-fs-desktop)` }}
                        >
                            {title || "Discover the World's Hidden Wonders"}
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                            {description || subtitle || "Find the unique moments and hidden gems that ignite unforgettable experiences."}
                        </p>
                        {buttonText && (
                            <Link
                                href={buttonUrl || '#'}
                                className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-base font-medium rounded-full hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 shadow-lg active:scale-95"
                            >
                                {buttonText}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        )}
                    </div>

                    {/* Image Composition - Right */}
                    <div className="relative h-[500px]">
                        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gray-200/20 rounded-full blur-3xl opacity-30 -z-10"></div>
                        <div className="grid grid-cols-2 gap-4 h-full">
                            <div className="col-span-1 h-full pt-12">
                                <div className="h-full w-full rounded-2xl overflow-hidden shadow-xl bg-gray-200 relative group">
                                    <img
                                        src={img1}
                                        alt="Hero 1"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 grid grid-rows-2 gap-4 h-full pb-12">
                                <div className="h-full w-full rounded-2xl overflow-hidden shadow-xl bg-gray-200 relative group">
                                    <img
                                        src={img2}
                                        alt="Hero 2"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="h-full w-full rounded-2xl overflow-hidden shadow-xl bg-gray-200 relative group">
                                    <img
                                        src={img3}
                                        alt="Hero 3"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
