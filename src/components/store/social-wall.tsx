'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Heart, MessageCircle } from 'lucide-react'

interface SocialPost {
    id: string
    type: 'image' | 'video'
    url: string
    username: string
    caption?: string
    likes?: number
}

interface SocialWallProps {
    title?: string
    subtitle?: string
    username?: string
    profileUrl?: string
    followButtonText?: string
    backgroundColor?: string
    textColor?: string
    posts?: SocialPost[]
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
}

export function SocialWall({
    title,
    subtitle,
    username,
    profileUrl,
    followButtonText,
    backgroundColor = '#FFFDF7',
    textColor = '#333333',
    posts = [],
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false
}: SocialWallProps) {
    return (
        <section
            className="w-full relative overflow-hidden"
            style={{
                backgroundColor,
                color: textColor,
                paddingTop: isMobile ? `${paddingYMobile}px` : `${paddingYDesktop}px`,
                paddingBottom: isMobile ? `${paddingYMobile}px` : `${paddingYDesktop}px`
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    {title && (
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="text-lg md:text-xl opacity-80 mb-8">
                            {subtitle}
                        </p>
                    )}

                    {/* Profile Action */}
                    {(username || followButtonText) && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {username && (
                                <span className="text-lg font-medium">
                                    {username}
                                </span>
                            )}
                            {followButtonText && (
                                <Link
                                    href={profileUrl || '#'}
                                    className="inline-flex items-center justify-center px-8 py-3 rounded-full text-sm font-medium transition-all transform hover:scale-105"
                                    style={{
                                        backgroundColor: textColor,
                                        color: backgroundColor
                                    }}
                                >
                                    {followButtonText}
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Grid */}
                <div className={cn(
                    "grid gap-4",
                    isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"
                )}>
                    {posts.map((post, index) => (
                        <div
                            key={post.id || index}
                            className="group relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden cursor-pointer"
                        >
                            <img
                                src={post.url}
                                alt={post.caption || 'Social post'}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className={cn(
                                "absolute inset-0 bg-black/40 transition-opacity duration-300 flex flex-col justify-end p-6",
                                isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}>
                                <div className={cn(
                                    "text-white transition-transform duration-300",
                                    isMobile ? "translate-y-0" : "transform translate-y-4 group-hover:translate-y-0"
                                )}>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="flex items-center gap-1.5">
                                            <Heart className="w-4 h-4 fill-white" />
                                            <span className="text-sm font-medium">{post.likes || 0}</span>
                                        </div>
                                    </div>
                                    {post.caption && (
                                        <p className="text-sm line-clamp-2 text-white/90">
                                            {post.caption}
                                        </p>
                                    )}
                                    {post.username && (
                                        <div className="mt-2 text-xs text-white/70">
                                            @{post.username.replace('@', '')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
