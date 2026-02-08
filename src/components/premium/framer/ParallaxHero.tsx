'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ParallaxHeroProps {
    image: string
    title: string
    subtitle?: string
    height?: string // e.g., 'h-[80vh]'
    overlayOpacity?: number
}

export function ParallaxHero({
    image,
    title,
    subtitle,
    height = 'h-[80vh]',
    overlayOpacity = 0.4,
}: ParallaxHeroProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    })

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <div ref={ref} className={cn('relative w-full overflow-hidden', height)}>
            {/* Parallax Background */}
            <motion.div
                style={{ y }}
                className="absolute inset-0 w-full h-[120%]" // Extra height for parallax
            >
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${image})` }}
                />
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: overlayOpacity }}
                />
            </motion.div>

            {/* Content */}
            <motion.div
                style={{ opacity }}
                className="relative h-full flex flex-col items-center justify-center text-center text-white px-4 z-10"
            >
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
                >
                    {title}
                </motion.h1>
                {subtitle && (
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                        className="text-lg md:text-xl font-light text-white/90 max-w-2xl"
                    >
                        {subtitle}
                    </motion.p>
                )}
            </motion.div>
        </div>
    )
}
