'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ImageCard {
    title: string
    subtitle?: string
    imageUrl: string
    link?: string
}

interface ImageCardGridProps {
    title?: string
    headerButtonText?: string
    headerButtonUrl?: string
    cards?: ImageCard[]
    columns?: number // 2, 3, or 4
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
    backgroundColor?: string
}

export function ImageCardGrid({
    title,
    headerButtonText,
    headerButtonUrl,
    cards = [],
    columns = 4,
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false,
    backgroundColor
}: ImageCardGridProps) {

    // Grid class logic
    const gridCols = {
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4'
    }[columns] || 'lg:grid-cols-4'

    const gridClass = isMobile
        ? 'grid-cols-1 gap-4'
        : `grid-cols-1 sm:grid-cols-2 ${gridCols} gap-4 sm:gap-6`


    return (
        <section
            className={cn(
                "w-full",
                isMobile ? "" : "py-[var(--py-mobile)] md:py-[var(--py-desktop)]"
            )}
            style={{
                backgroundColor: backgroundColor,
                paddingTop: isMobile ? `${paddingYMobile}px` : undefined,
                paddingBottom: isMobile ? `${paddingYMobile}px` : undefined,
                '--py-desktop': `${paddingYDesktop}px`,
                '--py-mobile': `${paddingYMobile}px`,
            } as any}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                    <div>
                        {title && <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>}
                    </div>
                    {headerButtonText && (
                        <div className="mt-4 md:mt-0">
                            <Link
                                href={headerButtonUrl || '#'}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                            >
                                {headerButtonText}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Grid */}
                <div className={`grid ${gridClass}`}>
                    {cards.map((card, index) => (
                        <div key={index} className="group cursor-pointer">
                            <Link href={card.link || '#'}>
                                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-200 mb-4">
                                    <img
                                        src={card.imageUrl}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{card.title}</h3>
                                {card.subtitle && <p className="text-sm text-gray-500">{card.subtitle}</p>}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
