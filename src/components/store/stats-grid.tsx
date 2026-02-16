'use client'

import { motion, useSpring, useTransform, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface StatItem {
    value: string
    label: string
}

interface StatsGridProps {
    title?: string
    description?: string
    stats?: StatItem[]
    logos?: string[]
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
}

function AnimatedStatValue({ value }: { value: string }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    // Parse the value string to extract number and non-number parts
    // Supports formats like "25+", "$500", "98%", "1,000"
    const parsed = value.match(/^(\D*)([\d,\.]+)(\D*)$/)

    if (!parsed) {
        return <span ref={ref}>{value}</span>
    }

    const [, prefix, numberStr, suffix] = parsed
    const number = parseFloat(numberStr.replace(/,/g, ''))

    const spring = useSpring(0, {
        mass: 1,
        stiffness: 100,
        damping: 30,
        duration: 2000
    })

    const displayValue = useTransform(spring, (current) => {
        // Handle integers vs floats based on input
        if (numberStr.includes('.')) {
            const decimals = numberStr.split('.')[1].length
            return current.toFixed(decimals)
        }
        return Math.round(current).toLocaleString()
    })

    useEffect(() => {
        if (isInView) {
            spring.set(number)
        }
    }, [isInView, number, spring])

    return (
        <span ref={ref} className="inline-flex">
            {prefix}
            <motion.span>{displayValue}</motion.span>
            {suffix}
        </span>
    )
}

export function StatsGrid({
    title = "Why Choose Us",
    description = "We bring years of experience and a passion for architectural excellence to every project.",
    stats = [
        { value: "15+", label: "Years Experience" },
        { value: "200+", label: "Projects Completed" },
        { value: "50+", label: "Awards Won" },
        { value: "100%", label: "Client Satisfaction" }
    ],
    logos = [],
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false
}: StatsGridProps) {
    return (
        <section
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-t-[40px]"
            style={{
                paddingTop: `${isMobile ? paddingYMobile : paddingYDesktop}px`,
                paddingBottom: `${isMobile ? paddingYMobile : paddingYDesktop}px`
            }}
        >
            <div className="mb-10">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">{title}</h2>
                <p className="text-sm md:text-base opacity-70 leading-relaxed max-w-2xl">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12">
                {stats.map((stat: StatItem, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-800 rounded-2xl">
                        <p className="font-display text-3xl font-bold mb-1">
                            <AnimatedStatValue value={stat.value} />
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {logos && logos.length > 0 && (
                <div className="flex flex-wrap justify-between items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    {logos.map((logo: string, index: number) => (
                        <div key={index} className="h-6 md:h-8 flex items-center justify-center">
                            <img
                                src={logo}
                                alt={`Partner ${index + 1}`}
                                className="h-full object-contain max-w-[120px]"
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
