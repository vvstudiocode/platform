'use client'

import React, { useRef } from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TextParallaxContentProps {
    imgUrl: string
    subheading: string
    heading: string
    children: React.ReactNode
}

export const TextParallaxContent = ({
    imgUrl,
    subheading,
    heading,
    children,
}: TextParallaxContentProps) => {
    return (
        <div
            style={{
                paddingLeft: 12,
                paddingRight: 12,
            }}
        >
            <div className="relative h-[150vh]">
                <StickyImage imgUrl={imgUrl} />
                <OverlayCopy heading={heading} subheading={subheading} />
            </div>
            {children}
        </div>
    )
}

const StickyImage = ({ imgUrl }: { imgUrl: string }) => {
    const targetRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["end end", "end start"],
    })

    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85])
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

    return (
        <motion.div
            style={{
                backgroundImage: `url(${imgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                // height: `calc(100vh - 24px)`, // Removed inline height for responsive classes
                top: 12,
                scale,
            }}
            ref={targetRef}
            className="sticky z-0 overflow-hidden rounded-3xl h-auto aspect-[3/4] w-full md:aspect-auto md:h-[calc(100vh-24px)]"
        >
            <motion.div
                className="absolute inset-0 bg-neutral-950/70"
                style={{
                    opacity,
                }}
            />
        </motion.div>
    )
}

const OverlayCopy = ({
    subheading,
    heading,
}: {
    subheading: string
    heading: string
}) => {
    return (
        <div
            className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-start pt-24 md:h-screen md:justify-center md:pt-0 text-white z-10 pointer-events-none"
        >
            <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl font-medium drop-shadow-lg">
                {subheading}
            </p>
            <p className="text-center text-4xl font-bold md:text-7xl drop-shadow-lg px-4">{heading}</p>
        </div>
    )
}

interface ExampleContentProps {
    title?: string
    description1?: string
    description2?: string
    buttonText?: string
    buttonLink?: string
    backgroundColor?: string
    buttonColor?: string
    onButtonClick?: () => void
}

export const ExampleContent = ({
    title = "數據驅動的會員運營",
    description1 = "整合線上與線下會員數據，精準描繪消費者輪廓。透過全方位的數據分析，洞察顧客需求，提供個人化的購物體驗，有效提升會員黏著度與終身價值。",
    description2 = "從流量獲取到會員留存，我們提供完整的數位轉型解決方案。讓您的品牌在數位浪潮中站穩腳步，創造持續性的營收成長。",
    buttonText = "了解更多",
    buttonLink,
    backgroundColor = "#ffffff",
    buttonColor = "#171717",
    onButtonClick,
}: ExampleContentProps) => {
    const ButtonComponent = (
        <Button
            onClick={onButtonClick}
            className="w-full md:w-fit text-xl px-9 py-6 h-auto text-white"
            style={{ backgroundColor: buttonColor }}
        >
            {buttonText} <ArrowUpRight className="ml-2 h-5 w-5" />
        </Button>
    )

    return (
        <div
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-8 md:pb-24 md:pt-12 flex flex-col gap-8 rounded-3xl"
            style={{ backgroundColor }}
        >
            <h2 className="text-2xl font-bold md:text-3xl">
                {title}
            </h2>
            <div className="text-lg text-neutral-600 md:text-xl md:text-2xl space-y-8">
                <p>
                    {description1}
                </p>
                <p>
                    {description2}
                </p>
                {buttonLink ? (
                    <a href={buttonLink} className="inline-block w-full md:w-fit">
                        {ButtonComponent}
                    </a>
                ) : (
                    ButtonComponent
                )}
            </div>
        </div>
    )
}
