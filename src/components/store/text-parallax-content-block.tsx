'use client'

import React from 'react'
import { TextParallaxContent, ExampleContent } from '@/components/ui/text-parallax-content'

interface TextParallaxContentBlockProps {
    items?: Array<{
        imgUrl: string
        subheading: string
        heading: string
        contentTitle?: string
        contentDescription1?: string
        contentDescription2?: string
        contentButtonText?: string
        contentButtonLink?: string
        contentBackgroundColor?: string
        contentButtonColor?: string
    }>
    buttonText?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    backgroundColor?: string
}

export function TextParallaxContentBlock({
    items = [],
    buttonText,
    paddingYDesktop,
    paddingYMobile,
    backgroundColor
}: TextParallaxContentBlockProps) {
    if (!items || items.length === 0) {
        return null
    }

    return (
        <div style={{ backgroundColor: backgroundColor || 'transparent' }}>
            {items.map((item, index) => (
                <TextParallaxContent
                    key={index}
                    imgUrl={item.imgUrl}
                    subheading={item.subheading}
                    heading={item.heading}
                >
                    <ExampleContent
                        title={item.contentTitle}
                        description1={item.contentDescription1}
                        description2={item.contentDescription2}
                        buttonText={item.contentButtonText || buttonText}
                        buttonLink={item.contentButtonLink}
                        backgroundColor={item.contentBackgroundColor}
                        buttonColor={item.contentButtonColor}
                    />
                </TextParallaxContent>
            ))}
        </div>
    )
}
