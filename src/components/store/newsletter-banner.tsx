'use client'

import React from 'react'
import Link from 'next/link'

interface NewsletterBannerProps {
    title?: string
    subtitle?: string // e.g., Privacy Policy text
    placeholder?: string
    buttonText?: string
    backgroundImage?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
    overlayOpacity?: number
    buttonUrl?: string
}

export function NewsletterBanner({
    title = "Get Your Inspiration Straight to Your Inbox",
    subtitle = "Subscribe to receive news. Read our Privacy Policy.",
    placeholder = "Email address",
    buttonText = "Subscribe",
    backgroundImage = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
    paddingYDesktop = 80,
    paddingYMobile = 64,
    isMobile = false,
    overlayOpacity = 0.5,
    buttonUrl
}: NewsletterBannerProps) {

    return (
        <section
            className="relative overflow-hidden w-full bg-gray-900"
            style={{
                paddingTop: `${paddingYMobile}px`,
                paddingBottom: `${paddingYMobile}px`
            }}
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={backgroundImage}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: overlayOpacity }}
                ></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                    {title.split('\n').map((line, i) => (
                        <span key={i} className="block">{line}</span>
                    ))}
                </h2>

                <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 mb-6" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        className="flex-1 w-full px-5 py-3 rounded-full border-0 focus:ring-2 focus:ring-white/50 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm shadow-sm outline-none transition-all"
                        placeholder={placeholder}
                    />
                    {buttonUrl ? (
                        <Link
                            href={buttonUrl}
                            className="px-8 py-3 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors shadow-lg block text-center"
                        >
                            {buttonText}
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className="px-8 py-3 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            {buttonText}
                        </button>
                    )}
                </form>

                {subtitle && (
                    <p className="text-xs text-white/60">
                        {subtitle}
                    </p>
                )}
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
