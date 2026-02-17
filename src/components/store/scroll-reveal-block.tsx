import React from 'react'
import styles from './scroll-reveal-block.module.css'
import { cn } from '@/lib/utils'

interface ScrollRevealItem {
    id: string
    title: string
    description: string
    image: string
    backgroundColor: string
}

interface ScrollRevealBlockProps {
    items: ScrollRevealItem[]
    className?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    backgroundColor?: string
}

export function ScrollRevealBlock({
    items = [],
    className,
    paddingYDesktop = 0,
    paddingYMobile = 0,
    backgroundColor
}: ScrollRevealBlockProps) {
    if (!items.length) return null

    return (
        <div
            className={cn(styles.scrollRevealContainer, className)}
            style={{
                '--padding-y-desktop': `${paddingYDesktop}px`,
                '--padding-y-mobile': `${paddingYMobile}px`,
                backgroundColor: backgroundColor
            } as React.CSSProperties}
        >
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className={styles.section}
                    style={{
                        backgroundColor: item.backgroundColor || backgroundColor,
                        zIndex: index + 1
                    }}
                >
                    <div className={styles.contentWrapper}>
                        <div className={styles.textContent}>
                            <div className={styles.title}>{item.title}</div>
                            <div className={styles.desc}>{item.description}</div>
                        </div>
                        <div className={styles.imageWrapper}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.title} className={styles.img} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
