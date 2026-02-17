'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { ProductListBlock, ProductCategoryBlock, ProductCarouselBlock } from './product-blocks'
import { ShowcaseSlider } from '../store/showcase-slider'

import { ParallaxHero } from '../premium/framer/ParallaxHero'
import { AnimatedGrid } from '../premium/framer/AnimatedGrid'
import { AnimatedTextBlock } from '../store/animated-text-block'
import { MarqueeBlock } from '../store/marquee-block'
import { ImageMarqueeBlock } from '../store/image-marquee-block'
import { ParallaxScrollGallery } from '../premium/framer/ParallaxScrollGallery'
import { AnimatedTestimonials } from '../ui/image-testimonials'
import { ThreeDMarquee } from '../ui/marquee-3d'
import { AppleCardsCarousel } from '../ui/apple-cards-carousel'
import { HeroComposition } from '../store/hero-composition'
import { ImageCardGrid } from '../store/image-card-grid'
import { MagazineGrid } from '../store/magazine-grid'
import { TestimonialShowcase } from '../store/testimonial-showcase'
import { NewsletterBanner } from '../store/newsletter-banner'

import { StatsGrid } from '../store/stats-grid'
import { ScrollableCards } from '../store/scrollable-cards'
import { PortfolioGrid } from '../store/portfolio-grid'
import { ThreadsBlock } from '../store/threads-block'
import { FlowingMenuBlock } from '../store/flowing-menu-block'
import { ImageTrailBlock } from '../store/image-trail-block'
import { BeforeAfterSlider } from '../store/before-after-slider'
import { ScrollRevealBlock } from '../store/scroll-reveal-block'
import ShinyText from '../store/shiny-text'
import GradientText from '../store/gradient-text'
import RotatingText from '../store/rotating-text'
import dynamic from 'next/dynamic'

// Inline LoadingState
function LoadingState() {
    return <div className="w-full h-96 flex items-center justify-center text-gray-400">Loading 3D Model...</div>
}

const Product360Viewer = dynamic(
    () => import('../premium/three/Product360Viewer').then(mod => mod.Product360Viewer),
    { ssr: false, loading: () => <LoadingState /> }
)

const ParticleBackground = dynamic(
    () => import('../premium/three/ParticleBackground').then(mod => mod.ParticleBackground),
    { ssr: false }
)

// ... existing code ...



interface PageComponent {
    id?: string
    type: string
    props?: Record<string, any>
    // 兼容舊格式
    title?: string
    content?: string
    subtitle?: string
    url?: string
    alt?: string
    imageUrl?: string
    backgroundUrl?: string
}

function useInView(options = {}) {
    const ref = useRef(null)
    const [isInView, setIsInView] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true)
                observer.disconnect()
            }
        }, options)

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) {
                observer.disconnect()
            }
        }
    }, [ref, options])

    return [ref, isInView] as const
}

import { ReactNode } from 'react'

// ... imports

interface Props {
    content: PageComponent[]
    storeSlug?: string
    tenantId?: string
    preview?: boolean
    previewDevice?: 'mobile' | 'desktop'
    backgroundColor?: string
    children?: ReactNode
}

function AnimationWrapper({ children, animation, className }: { children: ReactNode; animation?: any; className?: string }) {
    const [ref, isInView] = useInView({ threshold: 0.1 })
    // If no animation, just render
    if (!animation || !animation.type || animation.type === 'none') {
        return <div className={className}>{children}</div>
    }

    return (
        <div ref={ref as any} className={`${className} ${isInView ? getAnimationClass(animation) : 'opacity-0'}`} style={getAnimationDelay(animation?.delay)}>
            {children}
        </div>
    )
}

export function PageContentRenderer({ content, storeSlug = '', tenantId = '', preview = false, previewDevice = 'desktop', backgroundColor = '#ffffff', selectedId, children }: Props & { selectedId?: string }) {
    // 定義哪些區塊應該是全寬的
    const isFullWidthBlock = (type: string) => {
        // 目前只設定 Hero Banner 為全寬，如需其他元件（如輪播）也全寬，可在此加入
        return ['hero', 'hero_composition', 'showcase_slider', 'marquee', 'image_marquee', 'newsletter_banner', 'testimonial_showcase', 'image_card_grid', 'magazine_grid', 'scrollable_cards', 'stats_grid', 'portfolio_grid', 'threads_block', 'before_after', 'scroll_reveal', 'shiny_text', 'gradient_text', 'rotating_text'].includes(type)
    }

    return (
        <div
            className="min-h-full w-full flex flex-col"
            style={{ backgroundColor: backgroundColor || '#ffffff' }}
        >
            {/* 靜態內容（如果有）保持限制寬度 */}
            {children && (
                <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mb-8">
                    {children}
                </div>
            )}

            {content.map((block, index) => {
                const fullWidth = isFullWidthBlock(block.type)

                return (
                    <div
                        key={`${block.id || index}-${JSON.stringify(block.props?.animation)}`}
                        id={`preview-${block.id}`}
                        className={`scroll-mt-32 transition-all duration-300 w-full ${
                            // 只有被選中時才顯示外框，且要確保外框可見
                            block.id === selectedId
                                ? 'relative z-10 ring-2 ring-rose-500 ring-offset-4 ring-offset-white'
                                : ''
                            } ${
                            // 根據區塊類型決定是否限制寬度
                            fullWidth
                                ? ''
                                : 'max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8'
                            } ${
                            // 垂直間距
                            preview && previewDevice === 'mobile'
                                ? 'py-[var(--py-mobile)]'
                                : 'py-[var(--py-mobile)] md:py-[var(--py-desktop)]'
                            }`}
                        style={{
                            '--py-desktop': `${block.props?.paddingYDesktop ?? 64}px`,
                            '--py-mobile': `${block.props?.paddingYMobile ?? 32}px`,
                        } as any}
                    >
                        <AnimationWrapper animation={block.props?.animation} className="w-full h-full">
                            <ContentBlock block={block} storeSlug={storeSlug} tenantId={tenantId} preview={preview} previewDevice={previewDevice} />
                        </AnimationWrapper>
                    </div>
                )
            })}
        </div>
    )
}

function getAnimationClass(animation?: { type: string; duration?: string }) {
    if (!animation || !animation.type || animation.type === 'none') return ''

    const base = 'animate-in fill-mode-both'
    const durations: Record<string, string> = {
        slower: 'duration-1000',
        slow: 'duration-700',
        normal: 'duration-500',
        fast: 'duration-300',
        faster: 'duration-150'
    }
    const durationClass = durations[animation.duration || 'normal'] || 'duration-500'

    const types: Record<string, string> = {
        'fade-in': 'fade-in',
        'fade-in-up': 'fade-in slide-in-from-bottom-10',
        'fade-in-down': 'fade-in slide-in-from-top-10',
        'fade-in-left': 'fade-in slide-in-from-right-10',
        'fade-in-right': 'fade-in slide-in-from-left-10',
        'zoom-in': 'zoom-in',
        'zoom-out': 'zoom-out'
    }
    const typeClass = types[animation.type] || ''

    return `${base} ${typeClass} ${durationClass}`
}

function getAnimationDelay(delay?: string) {
    if (!delay) return {}
    return { animationDelay: `${delay}ms` }
}

function ContentBlock({ block, storeSlug, tenantId, preview, previewDevice }: { block: PageComponent; storeSlug: string; tenantId: string; preview: boolean; previewDevice: 'mobile' | 'desktop' }) {
    // 兼容新舊格式的取值函數
    const getVal = (key: string) => block.props?.[key] ?? (block as any)[key]
    const isMobile = preview && previewDevice === 'mobile'

    switch (block.type) {
        case 'hero':
            return <HeroBlock block={block} preview={preview} previewDevice={previewDevice} />
        case 'text':
            return <TextBlock block={block} />
        case 'heading':
            return <HeadingBlock block={block} />
        case 'image':
            return <ImageBlock block={block} preview={preview} previewDevice={previewDevice} />
        case 'features':
            return <FeaturesBlock block={block} />
        case 'faq':
            return <FAQBlock block={block} />
        case 'carousel':
            return <CarouselBlock block={block} />
        case 'image_text':
            return <ImageTextBlock block={block} preview={preview} previewDevice={previewDevice} />
        case 'text_columns':
            return <TextColumnsBlock block={block} />
        case 'image_grid':
            return <ImageGridBlock block={block} preview={preview} previewDevice={previewDevice} />
        case 'product_list':
            return <ProductListBlock
                productIds={block.props?.productIds || []}
                title={block.props?.title}
                titleAlign={block.props?.titleAlign}
                layout={block.props?.layout}
                columns={block.props?.columns}
                layoutDesktop={block.props?.layoutDesktop}
                columnsDesktop={block.props?.columnsDesktop}
                layoutMobile={block.props?.layoutMobile}
                columnsMobile={block.props?.columnsMobile}
                storeSlug={storeSlug}
                preview={preview}
                previewDevice={previewDevice}
                objectFitDesktop={block.props?.objectFitDesktop}
                objectFitMobile={block.props?.objectFitMobile}
                aspectRatioDesktop={block.props?.aspectRatioDesktop}
                aspectRatioMobile={block.props?.aspectRatioMobile}
            />
        case 'product_category':
            return <ProductCategoryBlock
                category={block.props?.category || ''}
                title={block.props?.title}
                titleAlign={block.props?.titleAlign}
                limit={block.props?.limit}
                layout={block.props?.layout}
                columns={block.props?.columns}
                layoutDesktop={block.props?.layoutDesktop}
                columnsDesktop={block.props?.columnsDesktop}
                layoutMobile={block.props?.layoutMobile}
                columnsMobile={block.props?.columnsMobile}
                storeSlug={storeSlug}
                tenantId={tenantId}
                preview={preview}
                previewDevice={previewDevice}
                objectFitDesktop={block.props?.objectFitDesktop}
                objectFitMobile={block.props?.objectFitMobile}
                aspectRatioDesktop={block.props?.aspectRatioDesktop}
                aspectRatioMobile={block.props?.aspectRatioMobile}
            />
        case 'product_carousel':
            return <ProductCarouselBlock
                productIds={block.props?.productIds || []}
                title={block.props?.title}
                titleAlign={block.props?.titleAlign}
                autoplay={block.props?.autoplay}
                interval={block.props?.interval}
                storeSlug={storeSlug}
                preview={preview}
                previewDevice={previewDevice}
            />
        case 'parallax_hero':
            return <ParallaxHero
                image={block.props?.image || ''}
                title={block.props?.title || ''}
                subtitle={block.props?.subtitle}
                height={block.props?.height}
            />

        case 'product_360':
            return <Product360Viewer
                modelUrl={block.props?.modelUrl}
                autoRotate={block.props?.autoRotate ?? true}
            />

        case 'particle_background':
            return (
                <div className="relative w-full h-[400px]">
                    <ParticleBackground
                        count={block.props?.count ?? 200}
                        color={block.props?.color ?? '#666'}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <h2 className="text-2xl font-bold text-gray-800">{block.props?.title || 'Particle Effect'}</h2>
                    </div>
                </div>
            )

        case 'animated_grid':
            return <AnimatedGrid
                items={block.props?.items || []}
                columns={block.props?.columns ?? 3}
            />

        case 'circular_carousel':
            return null // Removed
        case 'showcase_slider':
            return <ShowcaseSlider
                slides={block.props?.slides || []}
                autoplay={block.props?.autoplay ?? true}
                // height={block.props?.height} // Removed to enforce default 100vh-5rem
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                buttonHoverColor={block.props?.buttonHoverColor}
            />;

        case 'parallax_scroll_gallery':
            return <ParallaxScrollGallery
                images={block.props?.images || []}
                columns={block.props?.columns ?? 3}
                rotateX={block.props?.rotateX ?? 0}
                rotateY={block.props?.rotateY ?? 0}
                rotateZ={block.props?.rotateZ ?? 0}
                scale={block.props?.scale ?? 1.0}
                verticalSpacing={block.props?.verticalSpacing ?? 20}
                horizontalSpacing={block.props?.horizontalSpacing ?? 20}
                parallaxStrength={block.props?.parallaxStrength ?? 1.0}
                borderRadius={block.props?.borderRadius ?? 16}
                backgroundColor={block.props?.backgroundColor ?? '#ffffff'}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                title={block.props?.title}
                subtitle={block.props?.subtitle}
                buttonText={block.props?.buttonText}
                buttonLink={block.props?.buttonLink}
                buttonHoverColor={block.props?.buttonHoverColor}
            />;
        case 'animated_text':
            return <AnimatedTextBlock
                text={block.props?.text || 'YOUR TEXT HERE'}
                fontSizeDesktop={block.props?.fontSizeDesktop}
                fontSizeMobile={block.props?.fontSizeMobile}
                fontWeight={block.props?.fontWeight}
                textColor={block.props?.textColor}
                backgroundColor={block.props?.backgroundColor}
                animationType={block.props?.animationType}
                animationDuration={block.props?.animationDuration}
                animationDelay={block.props?.animationDelay}
                animationKey={block.props?.animationKey}
                textAlign={block.props?.textAlign}
                fullWidth={block.props?.fullWidth}
                height={block.props?.height}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                // Add key to force remount when animationKey changes (for replay)
                key={block.props?.animationKey ? `animated-text-${block.props.animationKey}` : undefined}
            />;
        case 'marquee':
            return <MarqueeBlock
                text={block.props?.text}
                speed={block.props?.speed}
                direction={block.props?.direction}
                pauseOnHover={block.props?.pauseOnHover}
                backgroundColor={block.props?.backgroundColor}
                textColor={block.props?.textColor}
                fontSize={block.props?.fontSize}
            />;
        case 'image_marquee':
            return <ImageMarqueeBlock
                images={block.props?.images}
                speed={block.props?.speed}
                direction={block.props?.direction}
                pauseOnHover={block.props?.pauseOnHover}
                backgroundColor={block.props?.backgroundColor}
                imageHeight={block.props?.imageHeight}
                imageGap={block.props?.imageGap}
                fadeOut={block.props?.fadeOut}
                scaleOnHover={block.props?.scaleOnHover}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
            />;
        case 'image_testimonials':
            return <AnimatedTestimonials
                testimonials={block.props?.testimonials || []}
                autoplay={block.props?.autoplay ?? false}
                autoplayDuration={block.props?.autoplayDuration}
                isMobile={preview && previewDevice === 'mobile'}
            />;
        case 'marquee_3d':
            return <ThreeDMarquee
                images={block.props?.images || []}
            />;
        case 'apple_cards_carousel':
            return <AppleCardsCarousel
                items={block.props?.items || []}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
            />;

        case 'hero_composition':
            return <HeroComposition
                title={block.props?.title}
                description={block.props?.description}
                subtitle={block.props?.subtitle}
                buttonText={block.props?.buttonText}
                buttonUrl={block.props?.buttonUrl}
                images={block.props?.images}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                isMobile={preview && previewDevice === 'mobile'}
            />

        case 'image_card_grid':
            return <ImageCardGrid
                title={block.props?.title}
                headerButtonText={block.props?.headerButtonText}
                headerButtonUrl={block.props?.headerButtonUrl}
                cards={block.props?.cards}
                columns={block.props?.columns}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                isMobile={preview && previewDevice === 'mobile'}
            />

        case 'magazine_grid':
            return <MagazineGrid
                title={block.props?.title}
                headerButtonText={block.props?.headerButtonText}
                headerButtonUrl={block.props?.headerButtonUrl}
                featuredStory={block.props?.featuredStory}
                sideStories={block.props?.sideStories}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                isMobile={preview && previewDevice === 'mobile'}
            />

        case 'testimonial_showcase':
            return <TestimonialShowcase
                sectionTitle={block.props?.sectionTitle}
                userName={block.props?.userName}
                userRole={block.props?.userRole}
                userAvatar={block.props?.userAvatar}
                rating={block.props?.rating}
                quoteTitle={block.props?.quoteTitle}
                quote={block.props?.quote}
                image1={block.props?.image1}
                image2={block.props?.image2}
                image2Text={block.props?.image2Text}
                headerButtonText={block.props?.headerButtonText}
                headerButtonUrl={block.props?.headerButtonUrl}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                isMobile={preview && previewDevice === 'mobile'}
            />

        case 'newsletter_banner':
            return <NewsletterBanner
                title={block.props?.title}
                subtitle={block.props?.subtitle}
                placeholder={block.props?.placeholder}
                buttonText={block.props?.buttonText}
                backgroundImage={block.props?.backgroundImage}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                overlayOpacity={block.props?.overlayOpacity}
                isMobile={preview && previewDevice === 'mobile'}
            />

        case 'stats_grid':
            return <StatsGrid
                title={block.props?.title}
                description={block.props?.description}
                stats={block.props?.stats}
                logos={block.props?.logos}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                isMobile={preview && previewDevice === 'mobile'}
            />
        case 'scrollable_cards':
            return <ScrollableCards
                title={block.props?.title}
                services={block.props?.services}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                isMobile={preview && previewDevice === 'mobile'}
            />
        case 'portfolio_grid':
            return <PortfolioGrid
                title={block.props?.title}
                subtitle={block.props?.subtitle}
                items={block.props?.items}
                showViewAll={block.props?.showViewAll}
                viewAllText={block.props?.viewAllText}
                viewAllUrl={block.props?.viewAllUrl}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                isMobile={preview && previewDevice === 'mobile'}
            />
        case 'threads_block':
            return <ThreadsBlock
                title={block.props?.title}
                description={block.props?.description}
                color={block.props?.color}
                backgroundColor={block.props?.backgroundColor}
                amplitude={block.props?.amplitude}
                distance={block.props?.distance}
                mobileAmplitude={block.props?.mobileAmplitude}
                mobileDistance={block.props?.mobileDistance}
                enableMouseInteraction={block.props?.enableMouseInteraction}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
                titleColor={block.props?.titleColor}
                descriptionColor={block.props?.descriptionColor}
                primaryButtonLabel={block.props?.primaryButtonLabel}
                primaryButtonLink={block.props?.primaryButtonLink}
                secondaryButtonLabel={block.props?.secondaryButtonLabel}
                secondaryButtonLink={block.props?.secondaryButtonLink}
                isMobile={preview && previewDevice === 'mobile'}
            />
        case 'flowing-menu-block':
            return <FlowingMenuBlock
                items={block.props?.items}
                speed={block.props?.speed}
                textColor={block.props?.textColor}
                bgColor={block.props?.bgColor}
                marqueeBgColor={block.props?.marqueeBgColor}
                marqueeTextColor={block.props?.marqueeTextColor}
                borderColor={block.props?.borderColor}
                height={block.props?.height}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
            />
        case 'image-trail-block':
            return <ImageTrailBlock
                images={block.props?.images}
                variant={block.props?.variant}
                height={block.props?.height}
                backgroundColor={block.props?.backgroundColor}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
            />
        case 'before_after':
            return <BeforeAfterSlider
                beforeImage={block.props?.beforeImage}
                afterImage={block.props?.afterImage}
                beforeLabel={block.props?.beforeLabel}
                afterLabel={block.props?.afterLabel}
                sliderColor={block.props?.sliderColor}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
            />
        case 'scroll_reveal':
            return <ScrollRevealBlock
                items={block.props?.items}
            />
        case 'shiny_text':
            return <ShinyText
                text={block.props?.text}
                disabled={block.props?.disabled}
                speed={block.props?.speed}
                color={block.props?.color}
                shineColor={block.props?.shineColor}
                spread={block.props?.spread}
                yoyo={block.props?.yoyo}
                pauseOnHover={block.props?.pauseOnHover}
                direction={block.props?.direction}
                delay={block.props?.delay}
                fontSizeDesktop={block.props?.fontSizeDesktop}
                fontSizeMobile={block.props?.fontSizeMobile}
                fontWeight={block.props?.fontWeight}
                textAlign={block.props?.textAlign}
                paddingYDesktop={block.props?.paddingYDesktop}
                paddingYMobile={block.props?.paddingYMobile}
            />
        case 'gradient_text':
            return <GradientText
                colors={block.props?.colors}
                animationSpeed={block.props?.animationSpeed}
                showBorder={block.props?.showBorder}
                direction={block.props?.direction}
                pauseOnHover={block.props?.pauseOnHover}
                yoyo={block.props?.yoyo}
                className={`
                    ${block.props?.textAlign === 'left' ? 'mr-auto ml-0' : block.props?.textAlign === 'right' ? 'ml-auto mr-0' : 'mx-auto'}
                `}
            >
                <div style={{
                    fontSize: `${isMobile ? block.props?.fontSizeMobile : block.props?.fontSizeDesktop}px`,
                    paddingTop: `${isMobile ? block.props?.paddingYMobile : block.props?.paddingYDesktop}px`,
                    paddingBottom: `${isMobile ? block.props?.paddingYMobile : block.props?.paddingYDesktop}px`,
                }}>
                    {block.props?.text}
                </div>
            </GradientText>
        case 'rotating_text':
            return <RotatingText
                texts={block.props?.texts}
                prefix={block.props?.prefix}
                rotationInterval={block.props?.rotationInterval}
                splitBy={block.props?.splitBy}
                staggerFrom={block.props?.staggerFrom}
                mainClassName={`
                    ${block.props?.textAlign === 'left' ? 'justify-start' : block.props?.textAlign === 'right' ? 'justify-end' : 'justify-center'}
                    rounded-lg overflow-hidden
                `}
                style={{
                    fontSize: `${isMobile ? block.props?.fontSizeMobile : block.props?.fontSizeDesktop}px`,
                    fontWeight: block.props?.fontWeight,
                    color: block.props?.color,
                    backgroundColor: block.props?.backgroundColor,
                    paddingTop: `${isMobile ? block.props?.paddingYMobile : block.props?.paddingYDesktop}px`,
                    paddingBottom: `${isMobile ? block.props?.paddingYMobile : block.props?.paddingYDesktop}px`,
                }}
            />
        default:
            return null
    }
}

// Hero Banner
function HeroBlock({ block, preview, previewDevice }: { block: PageComponent; preview?: boolean; previewDevice?: 'mobile' | 'desktop' }) {
    const title = block.props?.title ?? block.title
    const subtitle = block.props?.subtitle ?? block.subtitle
    const backgroundUrl = block.props?.backgroundUrl ?? block.backgroundUrl ?? block.imageUrl
    const buttonText = block.props?.buttonText
    const buttonUrl = block.props?.buttonUrl



    return (
        <div
            className={`relative w-full flex flex-col justify-center items-center text-center px-8 transition-all duration-300 min-h-[calc(100vh-5rem)]`}
            style={{
                backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
                backgroundColor: backgroundUrl ? undefined : '#1f2937',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                paddingTop: previewDevice === 'mobile' ? `${block.props?.paddingYMobile ?? 32}px` : `${block.props?.paddingYDesktop ?? 64}px`,
                paddingBottom: previewDevice === 'mobile' ? `${block.props?.paddingYMobile ?? 32}px` : `${block.props?.paddingYDesktop ?? 64}px`,
            } as any}
        >
            <style jsx>{`
                div {
                    background-size: cover;
                }
            `}</style>
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10">
                {title && <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{title}</h1>}
                {subtitle && <div className="text-lg md:text-xl text-gray-200">{subtitle}</div>}
                {buttonText && (
                    <Link
                        href={buttonUrl || '#'}
                        className="inline-block mt-6 px-6 py-2 bg-white/90 backdrop-blur-sm text-gray-900 font-medium rounded-full hover:bg-white transition-all shadow-lg"
                    >
                        {buttonText}
                    </Link>
                )}
            </div>
        </div>
    )
}

// 文字區塊 (Rich Text)
function TextBlock({ block }: { block: PageComponent }) {
    const {
        title,
        subtitle,
        content,
        align = 'center',
        textColor = '#000000',
        showButton = false,
        buttonText,
        buttonUrl
    } = block.props || {}

    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }[align as string] || 'text-center'

    return (
        <div className={`py-12 max-w-4xl mx-auto ${alignClass}`} style={{ color: textColor }}>
            {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
            {subtitle && <div className="text-xl opacity-80 mb-6">{subtitle}</div>}
            {content && (
                <div className="prose prose-lg max-w-none mb-8" style={{ color: textColor }}>
                    <div className="leading-relaxed whitespace-pre-wrap">{content}</div>
                </div>
            )}
            {showButton && buttonText && (
                <div className="mt-8">
                    <Link
                        href={buttonUrl || '#'}
                        className={`inline-block px-8 py-3 rounded-full transition-all ${textColor
                            ? 'border-2 border-current hover:opacity-80'
                            : 'bg-zinc-900 text-white hover:bg-zinc-800'
                            }`}
                    >
                        {buttonText}
                    </Link>
                </div>
            )}
        </div>
    )
}

// 標題 (Legacy, now can be handled by TextBlock)
function HeadingBlock({ block }: { block: PageComponent }) {
    const content = block.props?.content ?? block.content
    return (
        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 text-center">{content}</h2>
    )
}

// 圖片
function ImageBlock({ block, preview, previewDevice }: { block: PageComponent; preview?: boolean; previewDevice?: 'mobile' | 'desktop' }) {
    const url = block.props?.url ?? block.url
    const alt = block.props?.alt ?? block.alt ?? ''
    const fitDesktop = block.props?.objectFitDesktop || 'cover'
    const fitMobile = block.props?.objectFitMobile || 'cover'

    return (
        <img
            src={url}
            alt={alt}
            className={`w-full rounded-lg shadow-lg ${block.props && previewDevice === 'mobile' && preview
                ? 'object-[var(--fit-mobile)] aspect-[var(--aspect-mobile)]'
                : 'object-[var(--fit-mobile)] md:object-[var(--fit-desktop)] aspect-[var(--aspect-mobile)] md:aspect-[var(--aspect-desktop)]'
                }`}
            style={{
                '--fit-desktop': fitDesktop,
                '--fit-mobile': fitMobile,
                '--aspect-desktop': block.props?.aspectRatioDesktop || 'auto',
                '--aspect-mobile': block.props?.aspectRatioMobile || 'auto',
                objectFit: (preview && previewDevice === 'mobile') ? fitMobile : fitDesktop,
            } as React.CSSProperties}
        />
    )
}

// 特色區塊
function FeaturesBlock({ block }: { block: PageComponent }) {
    const title = block.props?.title ?? block.title
    const titleAlign = block.props?.titleAlign || 'center'
    const items = block.props?.items ?? []

    return (
        <div className="py-12 bg-gray-50 rounded-2xl">
            {title && (
                <h2 className={`text-2xl font-bold text-gray-800 mb-8 text-${titleAlign}`}>{title}</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
                {items.map((item: any, i: number) => (
                    <div key={i} className="text-center">
                        <div className="text-4xl mb-4">{item.icon}</div>
                        <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                        <div className="text-gray-600">{item.description}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// FAQ 問答區塊
function FAQBlock({ block }: { block: PageComponent }) {
    const title = block.props?.title ?? block.title
    const titleAlign = block.props?.titleAlign || 'center'
    const items = block.props?.items ?? []

    return (
        <div className="py-12">
            {title && (
                <h2 className={`text-2xl font-bold text-gray-800 mb-8 text-${titleAlign}`}>{title}</h2>
            )}
            <div className="space-y-4">
                {items.map((item: any, i: number) => (
                    <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
            </div>
        </div>
    )
}

// ... FAQItem ...

// ======================================
// 新增元件
// ======================================

// 1. 輪播圖 (Banner)
function CarouselBlock({ block }: { block: PageComponent }) {
    // ... (No title usually, or maybe inside?)
    // Keeping as is for now unless asked
    const images = block.props?.images ?? []
    const autoplay = block.props?.autoplay ?? true
    const interval = block.props?.interval ?? 5
    const [currentIndex, setCurrentIndex] = useState(0)

    // 自動輪播
    useEffect(() => {
        if (!autoplay || images.length === 0) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, interval * 1000)
        return () => clearInterval(timer)
    }, [autoplay, interval, images.length])

    if (images.length === 0) return null

    return (
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
            <div
                className="relative aspect-[var(--aspect-mobile)] md:aspect-[var(--aspect-desktop)]"
                style={{
                    '--aspect-desktop': block.props?.aspectRatioDesktop || '21/9',
                    '--aspect-mobile': block.props?.aspectRatioMobile || '16/9',
                } as React.CSSProperties}
            >
                {images.map((img: any, i: number) => (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-500 ${i === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {img.link ? (
                            <Link href={img.link}>
                                <img
                                    src={img.url}
                                    alt={img.alt || ''}
                                    className="w-full h-full object-[var(--fit-mobile)] md:object-[var(--fit-desktop)]"
                                    style={{
                                        '--fit-desktop': block.props?.objectFitDesktop || 'cover',
                                        '--fit-mobile': block.props?.objectFitMobile || 'cover',
                                    } as React.CSSProperties}
                                />
                            </Link>
                        ) : (
                            <img
                                src={img.url}
                                alt={img.alt || ''}
                                className="w-full h-full object-[var(--fit-mobile)] md:object-[var(--fit-desktop)]"
                                style={{
                                    '--fit-desktop': block.props?.objectFitDesktop || 'cover',
                                    '--fit-mobile': block.props?.objectFitMobile || 'cover',
                                } as React.CSSProperties}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* 指示點 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_: any, i: number) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-8' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

// 2. 圖文組合
function ImageTextBlock({ block, preview, previewDevice }: { block: PageComponent; preview?: boolean; previewDevice?: 'mobile' | 'desktop' }) {
    const layout = block.props?.layout ?? 'left'
    const imageUrl = block.props?.imageUrl
    const title = block.props?.title
    const content = block.props?.content
    const buttonText = block.props?.buttonText
    const buttonUrl = block.props?.buttonUrl
    const fitDesktop = block.props?.objectFitDesktop || 'cover'
    const fitMobile = block.props?.objectFitMobile || 'cover'

    return (
        <div className={`flex flex-col md:flex-row gap-8 items-center ${layout === 'right' ? 'md:flex-row-reverse' : ''
            }`}>
            {/* 圖片 */}
            {imageUrl && (
                <div className="w-full md:w-1/2">
                    <img
                        src={imageUrl}
                        alt={title || ''}
                        className={`w-full rounded-lg shadow-lg ${block.props && previewDevice === 'mobile' && preview
                            ? 'object-[var(--fit-mobile)] aspect-[var(--aspect-mobile)]'
                            : 'object-[var(--fit-mobile)] md:object-[var(--fit-desktop)] aspect-[var(--aspect-mobile)] md:aspect-[var(--aspect-desktop)]'
                            }`}
                        style={{
                            '--fit-desktop': fitDesktop,
                            '--fit-mobile': fitMobile,
                            '--aspect-desktop': block.props?.aspectRatioDesktop || 'auto',
                            '--aspect-mobile': block.props?.aspectRatioMobile || 'auto',
                            objectFit: (preview && previewDevice === 'mobile') ? fitMobile : fitDesktop,
                        } as React.CSSProperties}
                    />
                </div>
            )}

            {/* 文字 */}
            <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
                {title && <h2 className="text-3xl font-bold text-gray-900">{title}</h2>}
                {content && <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">{content}</div>}
                {buttonText && (
                    <Link
                        href={buttonUrl || '#'}
                        className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        {buttonText}
                    </Link>
                )}
            </div>
        </div>
    )
}

// 3. 文字組合
function TextColumnsBlock({ block }: { block: PageComponent }) {
    const columns = block.props?.columns ?? []
    const columnCount = block.props?.columnCount ?? 3

    return (
        <div className={`grid grid-cols-1 md:grid-cols-${columnCount} gap-8`}>
            {columns.map((col: any, i: number) => (
                <div key={i} className="space-y-3">
                    {col.title && <h3 className="text-xl font-semibold text-gray-900">{col.title}</h3>}
                    {col.content && <div className="text-gray-600 leading-relaxed">{col.content}</div>}
                </div>
            ))}
        </div>
    )
}

// 4. 圖片組合
function ImageGridBlock({ block, preview, previewDevice }: { block: PageComponent; preview?: boolean; previewDevice?: 'mobile' | 'desktop' }) {
    const images = block.props?.images ?? []
    const columns = block.props?.columns ?? 3
    const gap = block.props?.gap ?? 16

    return (
        <div
            className={`grid grid-cols-1 md:grid-cols-${columns}`}
            style={{ gap: `${gap}px` }}
        >
            {images.map((img: any, i: number) => (
                <div
                    key={i}
                    className={`relative rounded-lg overflow-hidden bg-gray-100 ${block.props && previewDevice === 'mobile' && preview
                        ? 'aspect-[var(--aspect-mobile)]'
                        : 'aspect-[var(--aspect-mobile)] md:aspect-[var(--aspect-desktop)]'
                        }`}
                    style={{
                        '--aspect-desktop': block.props?.aspectRatioDesktop || '1/1',
                        '--aspect-mobile': block.props?.aspectRatioMobile || '1/1',
                    } as React.CSSProperties}
                >
                    {img.link ? (
                        <Link href={img.link}>
                            <img
                                src={img.url}
                                alt={img.alt || ''}
                                className="w-full h-full transition-transform duration-300 object-[var(--fit-mobile)] md:object-[var(--fit-desktop)]"
                                style={{
                                    '--fit-desktop': block.props?.objectFitDesktop || 'cover',
                                    '--fit-mobile': block.props?.objectFitMobile || 'cover',
                                } as React.CSSProperties}
                            />
                        </Link>
                    ) : (
                        <img
                            src={img.url}
                            alt={img.alt || ''}
                            className={`w-full h-full object-[var(--fit-mobile)] ${block.props && previewDevice === 'mobile' && preview
                                ? ''
                                : 'md:object-[var(--fit-desktop)]'
                                }`}
                            style={{
                                '--fit-desktop': block.props?.objectFitDesktop || 'cover',
                                '--fit-mobile': block.props?.objectFitMobile || 'cover',
                                objectFit: (block.props && previewDevice === 'mobile' && preview)
                                    ? (block.props?.objectFitMobile || 'cover')
                                    : (block.props?.objectFitDesktop || 'cover'),
                            } as React.CSSProperties}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

// 商品元件已從 product-blocks.tsx 導入，不需要在此定義

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
            >
                <span className="font-medium text-gray-900">{question}</span>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-gray-600">
                    {answer}
                </div>
            )}
        </div>
    )
}
