"use client"

import React, { type RefObject } from "react"
import { motion, useScroll, useTransform, type Variants } from "motion/react"
import { cn } from "@/lib/utils"

interface TimelineContentProps {
    children: React.ReactNode
    animationNum: number
    timelineRef: RefObject<HTMLDivElement | null>
    className?: string
    as?: React.ElementType
    customVariants?: Variants
}

export function TimelineContent({
    children,
    animationNum,
    timelineRef,
    className,
    as: Component = "div",
    customVariants,
}: TimelineContentProps) {
    const { scrollYProgress } = useScroll({
        target: timelineRef,
        offset: ["start end", "end start"],
    })

    const defaultVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
        },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                delay: i * 0.2,
                duration: 0.5,
            },
        }),
    }

    const variants = customVariants || defaultVariants

    const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])

    return (
        <motion.div
            style={{ opacity }}
            className={cn(className)}
        >
            <motion.div
                custom={animationNum}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={variants}
            >
                {Component === "div" ? (
                    children
                ) : (
                    React.createElement(Component as any, {}, children)
                )}
            </motion.div>
        </motion.div>
    )
}
