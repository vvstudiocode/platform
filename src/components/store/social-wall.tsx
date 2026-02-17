'use client'

import React from 'react'
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SocialPost {
    id: string
    type: 'image' | 'video'
    url: string
    caption?: string
    username?: string
    avatar?: string
    likes?: number
}

interface SocialWallProps {
    title?: string
    subtitle?: string
    username?: string
    profileUrl?: string
    posts?: SocialPost[]
    layout?: 'grid' | 'masonry'
    columns?: number
    showFollowButton?: boolean
    followButtonText?: string
    backgroundColor?: string
    textColor?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
    fontSize?: number
}

export function SocialWall({
    title = '#NothingButYou',
    subtitle = 'Share your moments with us on Instagram',
    username = '@NBY_OFFICIAL',
    profileUrl = '#',
    posts = [],
    layout = 'masonry',
    columns = 4,

    showFollowButton = true,
    followButtonText = 'FOLLOW US',
    backgroundColor = '#FFFDF7',
    textColor = '#333333',
    paddingYDesktop = 100,
    paddingYMobile = 60,
    isMobile = false,
    fontSize = 16
}: SocialWallProps) {

    // Masonry Layout Calculation for multi-column (Desktop only)
    const getMasonryColumns = () => {
        // Mobile always return single column to ensure top-to-bottom order
        if (isMobile) return [posts]

        const cols = Array.from({ length: columns }, () => [] as SocialPost[])
        posts.forEach((post, i) => {
            cols[i % columns].push(post)
        })
        return cols
    }

    return (
        <section
            className={cn("w-full overflow-hidden")}
            style={{
                backgroundColor,
                color: textColor,
                paddingTop: isMobile ? `${paddingYMobile}px` : `${paddingYDesktop}px`,
                paddingBottom: isMobile ? `${paddingYMobile}px` : `${paddingYDesktop}px`,
            }}
        >
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12 md:mb-16 space-y-4">
                    {title && (
                        <h2
                            className="font-serif italic tracking-wide"
                            style={{ fontSize: isMobile ? `${fontSize * 1.8}px` : `${fontSize * 2.5}px` }}
                        >
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p
                            className="opacity-60 tracking-wide font-light"
                            style={{ fontSize: `${fontSize}px` }}
                        >
                            {subtitle}
                        </p>
                    )}

                    {showFollowButton && (
                        <div className="pt-6">
                            <Link
                                href={profileUrl || '#'}
                                target="_blank"
                                className="inline-flex items-center px-8 py-3 bg-transparent border border-current font-bold tracking-[0.2em] hover:bg-black hover:text-white hover:border-black transition-all duration-300 uppercase"
                                style={{ fontSize: `${Math.max(12, fontSize * 0.75)}px` }}
                            >
                                {followButtonText} {username}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Wall Grid */}
                {/* Mobile: Simple Grid (1 col) to ensure top-to-bottom order */}
                {isMobile ? (
                    <div className="grid grid-cols-1 gap-6">
                        {posts.map((post) => (
                            <SocialCard key={post.id} post={post} fontSize={fontSize} />
                        ))}
                    </div>
                ) : (
                    // Desktop: Grid or Masonry
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`}>
                        {posts.map((post) => (
                            <SocialCard key={post.id} post={post} fontSize={fontSize} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

function SocialCard({ post, fontSize }: { post: SocialPost, fontSize: number }) {
    return (
        <div className="group bg-white p-4 pb-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden mb-4 bg-gray-100 flex-shrink-0">
                <img
                    src={post.url}
                    alt={post.caption || 'Social post'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Instagram className="w-8 h-8 text-white drop-shadow-md" />
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3 px-1 text-left flex-1 flex flex-col">
                {post.username && (
                    <div className="flex items-center gap-2">
                        {post.avatar && (
                            <img src={post.avatar} alt={post.username} className="w-5 h-5 rounded-full" />
                        )}
                        <span
                            className="font-bold text-gray-900"
                            style={{ fontSize: `${Math.max(12, fontSize * 0.75)}px` }}
                        >
                            {post.username}
                        </span>
                    </div>
                )}

                {post.caption && (
                    <p
                        className="text-gray-600 leading-relaxed font-medium line-clamp-3 mb-2"
                        style={{ fontSize: `${Math.max(12, fontSize * 0.75)}px` }}
                    >
                        {post.caption}
                    </p>
                )}

                {post.likes && (
                    <div
                        className="mt-auto pt-2 flex items-center gap-1 text-gray-400"
                        style={{ fontSize: `${Math.max(12, fontSize * 0.75)}px` }}
                    >
                        <span className="text-yellow-500">★</span>
                        <span>{post.likes} likes</span>
                    </div>
                )}
            </div>
        </div>
    )
}
