'use client'

import React from 'react'
import Link from 'next/link'

interface StoryItem {
    category?: string
    title: string
    date?: string
    excerpt?: string // For featured item
    imageUrl: string
    link?: string
}

interface MagazineGridProps {
    title?: string
    headerButtonText?: string
    headerButtonUrl?: string
    featuredStory?: StoryItem
    sideStories?: StoryItem[] // usually 3 items
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
}

export function MagazineGrid({
    title,
    headerButtonText,
    headerButtonUrl,
    featuredStory,
    sideStories = [],
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false
}: MagazineGridProps) {
    if (!featuredStory && sideStories.length === 0) return null

    return (
        <section
            className="w-full bg-white"
            style={{
                paddingTop: `${paddingYMobile}px`,
                paddingBottom: `${paddingYMobile}px`
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    {title && <h2 className="text-3xl font-bold text-gray-900">{title}</h2>}
                    {headerButtonText && (
                        <Link
                            href={headerButtonUrl || '#'}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            {headerButtonText}
                        </Link>
                    )}
                </div>

                <div className={`grid gap-8 lg:gap-12 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-12'}`}>
                    {/* Main Featured Story */}
                    {featuredStory && (
                        <div className={`${isMobile ? 'w-full' : 'lg:col-span-7'} group cursor-pointer`}>
                            <Link href={featuredStory.link || '#'}>
                                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-200 mb-6">
                                    <img
                                        src={featuredStory.imageUrl}
                                        alt={featuredStory.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {featuredStory.category && (
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider text-gray-900">
                                                {featuredStory.category}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors">
                                    {featuredStory.title}
                                </h3>
                                {featuredStory.date && (
                                    <p className="text-sm text-gray-500 mb-4 font-medium">{featuredStory.date}</p>
                                )}
                                {featuredStory.excerpt && (
                                    <p className="text-gray-600 line-clamp-3 leading-relaxed">
                                        {featuredStory.excerpt}
                                    </p>
                                )}
                            </Link>
                        </div>
                    )}

                    {/* Side Stories List */}
                    <div className={`${isMobile ? 'w-full' : 'lg:col-span-5'} flex flex-col space-y-6 sm:space-y-8`}>
                        {sideStories.map((story, index) => (
                            <div key={index} className="group flex gap-5 items-start cursor-pointer">
                                <Link href={story.link || '#'} className="flex gap-5 w-full">
                                    <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-200">
                                        <img
                                            src={story.imageUrl}
                                            alt={story.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        {story.category && (
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                {story.category}
                                            </span>
                                        )}
                                        <h4 className="font-bold text-lg text-gray-900 mt-1 mb-2 leading-snug group-hover:text-gray-600 transition-colors">
                                            {story.title}
                                        </h4>
                                        {story.date && (
                                            <p className="text-xs text-gray-500">{story.date}</p>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
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
