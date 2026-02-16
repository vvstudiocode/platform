'use client'

import React from 'react'
import Link from 'next/link'
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
    isMobile = false
}: HeroCompositionProps) {
    // Default placeholders
    const img1 = images[0] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
    const img2 = images[1] || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
    const img3 = images[2] || "https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?q=80&w=1964&auto=format&fit=crop"

    return (
        <section
            className="relative overflow-hidden w-full"
            style={{
                paddingTop: `${paddingYMobile}px`,
                paddingBottom: `${paddingYMobile}px`
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Text Content */}
                    <div className="max-w-2xl mb-8 lg:mb-0">
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
                            {title || "Discover the World's Hidden Wonders"}
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                            {description || subtitle || "Find the unique moments and hidden gems that ignite unforgettable experiences."}
                        </p>
                        {buttonText && (
                            <Link
                                href={buttonUrl || '#'}
                                className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white text-base font-medium rounded-full hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 shadow-lg"
                            >
                                {buttonText}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        )}
                    </div>

                    {/* Image Composition - Desktop */}
                    <div className={`relative h-[500px] ${isMobile ? 'hidden' : 'hidden lg:block'}`}>
                        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50 -z-10"></div>

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

                    {/* Image Composition - Mobile */}
                    <div className={`relative h-[300px] w-full mt-8 ${isMobile ? 'block' : 'block lg:hidden'}`}>
                        <div className="h-full w-full rounded-2xl overflow-hidden shadow-xl bg-gray-200 relative group">
                            <img
                                src={img1}
                                alt="Hero Mobile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Desktop Styling override */}
            {!isMobile && <style jsx>{`
                @media (min-width: 1024px) {
                    section {
                        padding-top: ${paddingYDesktop}px !important;
                        padding-bottom: ${paddingYDesktop}px !important;
                    }
                }
            `}</style>}
        </section>
    )
}
