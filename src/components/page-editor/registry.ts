// 元件註冊表 - 統一管理所有頁面編輯器元件
import type { ComponentType } from 'react'
import type { EditorProps } from './shared/types'
import {
    HeroEditor,
    TextEditor,
    ImageTextEditor,
    TextColumnsEditor,
    CarouselEditor,
    ImageGridEditor,
    FeaturesEditor,
    FAQEditor,
    ShowcaseSliderEditor,

    ParallaxScrollGalleryEditor,
    ProductListEditor,
    ProductCategoryEditor,
    ProductCarouselEditor,
    AnimatedTextEditor,
    MarqueeEditor,
    ImageMarqueeEditor,
    ImageTestimonialsEditor,
    ThreeDMarqueeEditor,
    AppleCardsCarouselEditor,
    HeroCompositionEditor,
    ImageCardGridEditor,
    MagazineGridEditor,
    TestimonialShowcaseEditor,
    NewsletterBannerEditor,

    StatsGridEditor,
    ScrollableCardsEditor,
    PortfolioGridEditor,
    ThreadsBlockEditor,
    FlowingMenuBlockEditor,
    ImageTrailEditor
} from './editors'
import { Sparkles } from 'lucide-react'

export interface ComponentConfig {
    editor: ComponentType<EditorProps>
    label: string
    icon: string | ComponentType<any> // Updated to allow ComponentType for icons
    category: 'basic' | 'media' | 'product' | 'interactive'
    tier: 'free' | 'growth' // Added tier property
    defaultProps: Record<string, any>
}

export const componentRegistry: Record<string, ComponentConfig> = {
    // === 基礎元件 ===
    hero: {
        editor: HeroEditor,
        label: 'Hero Banner',
        icon: '🎯',
        category: 'basic',
        tier: 'free',
        defaultProps: {
            title: '',
            subtitle: '',
            backgroundUrl: '',
            buttonText: '',
            buttonUrl: ''
        }
    },
    text: {
        editor: TextEditor,
        label: '文字區塊',
        icon: '📝',
        category: 'basic',
        tier: 'free',
        defaultProps: {
            title: '',
            subtitle: '',
            content: '',
            align: 'center'
        }
    },
    text_columns: {
        editor: TextColumnsEditor,
        label: '多欄文字',
        icon: '📊',
        category: 'basic',
        tier: 'free',
        defaultProps: {
            columnCount: 3,
            columns: []
        }
    },
    features: {
        editor: FeaturesEditor,
        label: '特色區塊',
        icon: '✨',
        category: 'basic',
        tier: 'free',
        defaultProps: {
            title: '',
            items: []
        }
    },
    faq: {
        editor: FAQEditor,
        label: 'FAQ',
        icon: '❓',
        category: 'basic',
        tier: 'free',
        defaultProps: {
            title: '常見問題',
            items: []
        }
    },

    // === 媒體元件 ===
    carousel: {
        editor: CarouselEditor,
        label: '輪播圖',
        icon: '🎠',
        category: 'media',
        tier: 'free',
        defaultProps: {
            images: [],
            autoplay: true,
            interval: 5
        }
    },
    image_text: {
        editor: ImageTextEditor,
        label: '圖文組合',
        icon: '🖼️',
        category: 'media',
        tier: 'free',
        defaultProps: {
            layout: 'left',
            imageUrl: '',
            title: '',
            content: ''
        }
    },
    image_grid: {
        editor: ImageGridEditor,
        label: '圖片網格',
        icon: '🔲',
        category: 'media',
        tier: 'free',
        defaultProps: {
            columns: 3,
            gap: 16,
            images: []
        }
    },

    // === 商品元件 ===
    product_list: {
        editor: ProductListEditor,
        label: '商品列表',
        icon: '📦',
        category: 'product',
        tier: 'free',
        defaultProps: {
            title: '精選商品',
            productIds: [],
            columns: 3
        }
    },
    product_category: {
        editor: ProductCategoryEditor,
        label: '分類商品',
        icon: '🏷️',
        category: 'product',
        tier: 'free',
        defaultProps: {
            title: '商品分類',
            category: '',
            limit: 8
        }
    },
    product_carousel: {
        editor: ProductCarouselEditor,
        label: '商品輪播',
        icon: '🛒',
        category: 'product',
        tier: 'free',
        defaultProps: {
            title: '熱門商品',
            productIds: [],
            autoplay: true,
            interval: 5
        }
    },

    // === 進階互動元件 (Growth Tier) ===
    showcase_slider: {
        editor: ShowcaseSliderEditor,
        label: 'Showcase Slider',
        icon: '🎬',
        category: 'interactive',
        tier: 'free',
        defaultProps: {
            slides: [],
            autoplay: true,
            buttonHoverColor: '#e11d48'
        }
    },

    parallax_scroll_gallery: {
        editor: ParallaxScrollGalleryEditor,
        label: '視差滾動圖庫',
        icon: '🪜',
        category: 'interactive',
        tier: 'free',
        defaultProps: {
            title: 'Our Portfolio',
            subtitle: '',
            images: [],
            columns: 3,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1.0,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            parallaxStrength: 1.0,
            borderRadius: 16
        }
    },
    animated_text: {
        editor: AnimatedTextEditor,
        label: '動態文字',
        icon: '✨',
        category: 'interactive',
        tier: 'free',
        defaultProps: {
            text: 'YOUR TEXT HERE',
            fontSizeDesktop: 8,
            fontSizeMobile: 10,
            fontWeight: 900,
            textColor: '#1C1C1C',
            backgroundColor: '#FED75A',
            animationType: 'split-chars',
            animationDuration: 1,
            animationDelay: 0.05,
            textAlign: 'center',
            fullWidth: true,
            height: 'auto',
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    marquee: {
        editor: MarqueeEditor,
        label: '跑馬燈',
        icon: '📢',
        category: 'interactive',
        tier: 'growth',
        defaultProps: {
            text: 'WELCOME TO OUR STORE',
            speed: 30,
            direction: 'left',
            pauseOnHover: true,
            backgroundColor: '#000000',
            textColor: '#FFFFFF',
            fontSize: 16
        }
    },
    image_marquee: {
        editor: ImageMarqueeEditor,
        label: '圖片跑馬燈',
        icon: '🎠',
        category: 'media',
        tier: 'growth',
        defaultProps: {
            images: [
                {
                    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                    alt: '產品 1'
                },
                {
                    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                    alt: '產品 2'
                },
                {
                    url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
                    alt: '產品 3'
                }
            ],
            speed: 30,
            direction: 'left' as const,
            pauseOnHover: true,
            backgroundColor: '#ffffff',
            imageHeight: 100,
            imageGap: 32,
            fadeOut: false,
            scaleOnHover: false,
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    image_testimonials: {
        editor: ImageTestimonialsEditor,
        label: '動態見證牆',
        icon: 'message-square',
        category: 'media',
        tier: 'free',
        defaultProps: {
            testimonials: [
                {
                    quote: "這是一個非常棒的產品，完全改變了我們的工作方式。",
                    name: "使用者姓名",
                    designation: "職稱",
                    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop"
                }
            ],
            autoplay: true,
            autoplayDuration: 5000,
            paddingYDesktop: 0,
            paddingYMobile: 0,
        },
    },
    marquee_3d: {
        editor: ThreeDMarqueeEditor,
        label: '3D 跑馬燈',
        icon: 'layout-grid',
        category: 'interactive',
        tier: 'growth',
        defaultProps: {
            images: [
                "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=80",
            ],
            paddingYDesktop: 64,
            paddingYMobile: 32,
        },
    },
    apple_cards_carousel: {
        editor: AppleCardsCarouselEditor,
        label: '滑動卡片',
        icon: '📱',
        category: 'interactive',
        tier: 'growth',
        defaultProps: {
            items: [
                {
                    category: "人工智能",
                    title: "你可以用 AI 做更多事。",
                    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                },
                {
                    category: "生產力",
                    title: "提升你的生產力。",
                    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                },
                {
                    category: "產品",
                    title: "推出新的 Apple Vision Pro。",
                    src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                },
                {
                    category: "產品",
                    title: "Maps for your iPhone 15 Pro Max.",
                    src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                },
                {
                    category: "iOS",
                    title: "Photography just got better.",
                    src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                },
                {
                    category: "Hiring",
                    title: "Hiring for a Staff Software Engineer",
                    src: "https://images.unsplash.com/photo-1511984802559-2512431aa931?q=80&w=2928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                }
            ],
            paddingYDesktop: 0,
            paddingYMobile: 0,
        }
    },
    hero_composition: {
        editor: HeroCompositionEditor,
        label: '現代 Hero',
        icon: '🖼️',
        category: 'basic',
        tier: 'free',
        defaultProps: {
            title: 'Discover the World\'s Hidden Wonders',
            subtitle: 'Find unique moments and hidden gems.',
            description: 'Find the unique moments and hidden gems that ignite unforgettable experiences.',
            buttonText: 'Plan your trip',
            buttonUrl: '#',
            images: [
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1502920514313-52581002a659?q=80&w=2067&auto=format&fit=crop"
            ],
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    image_card_grid: {
        editor: ImageCardGridEditor,
        label: '圖片卡片網格',
        icon: '🔲',
        category: 'media',
        tier: 'free',
        defaultProps: {
            title: 'Top Destinations',
            headerButtonText: 'Explore all destinations',
            headerButtonUrl: '#',
            columns: 4,
            cards: [
                {
                    image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2070&auto=format&fit=crop",
                    title: "Golden Bridge",
                    subtitle: "Vietnam",
                    link: "#"
                },
                {
                    image: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?q=80&w=2064&auto=format&fit=crop",
                    title: "Dubrovnik",
                    subtitle: "Croatia",
                    link: "#"
                },
                {
                    image: "https://images.unsplash.com/photo-1527668752968-14dc70a27c73?q=80&w=2070&auto=format&fit=crop",
                    title: "Cappadocia",
                    subtitle: "Turkey",
                    link: "#"
                },
                {
                    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop",
                    title: "Sydney",
                    subtitle: "Australia",
                    link: "#"
                }
            ],
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    magazine_grid: {
        editor: MagazineGridEditor,
        label: '雜誌排版',
        icon: '📰',
        category: 'media',
        tier: 'free',
        defaultProps: {
            title: 'Latest Stories',
            headerButtonText: 'Read more articles',
            headerButtonUrl: '#',
            featuredStory: {
                image: "https://images.unsplash.com/photo-1496417263034-38ec4f0d665a?q=80&w=2071&auto=format&fit=crop",
                category: "Food and Drink",
                title: "Los Angeles food & drink guide: 10 things to try in Los Angeles, California",
                date: "Aug 12, 2024",
                readTime: "4 min read",
                excerpt: "It seems that in California, almost any problem can be solved with a combination of avocados, yoga, and dogs.",
                link: "#"
            },
            sideStories: [
                {
                    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
                    category: "Shopping",
                    title: "15 South London Markets You'll Love",
                    date: "Aug 15, 2024",
                    readTime: "6 min read",
                    link: "#"
                },
                {
                    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
                    category: "Hotels",
                    title: "10 incredible hotels around the world",
                    date: "Aug 10, 2024",
                    readTime: "5 min read",
                    link: "#"
                },
                {
                    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop",
                    category: "Travel Budget",
                    title: "Visiting Chicago on a Budget",
                    date: "Aug 02, 2024",
                    readTime: "8 min read",
                    link: "#"
                }
            ],
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    testimonial_showcase: {
        editor: TestimonialShowcaseEditor,
        label: '見證展示',
        icon: '💬',
        category: 'interactive',
        tier: 'free',
        defaultProps: {
            sectionTitle: "Trekker's Highlights",
            userName: "Maria Angelica",
            userRole: "Manila, Philippines",
            userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
            rating: 5,
            quoteTitle: "An Unforgettable Journey Through Turkey",
            quote: "Thanks to Glass Trekker, my trip to Turkey was truly magical. Their expert guides and insider tips led me to hidden gems.",
            image1: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2071&auto=format&fit=crop",
            image2: "https://images.unsplash.com/photo-1504512485720-7d83a16ee930?q=80&w=2122&auto=format&fit=crop",
            image2Text: "Scenes from Bosphorus Yacht Cruise",
            headerButtonText: "See more highlights",
            headerButtonUrl: "#",
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    newsletter_banner: {
        editor: NewsletterBannerEditor,
        label: '訂閱 Banner',
        icon: '📧',
        category: 'basic',
        tier: 'free',
        defaultProps: {
            title: 'Get Your Travel Inspiration Straight to Your Inbox',
            subtitle: 'Subscribe to receive travel news and exclusive promotions.',
            placeholder: 'Email address',
            buttonText: 'Subscribe',
            backgroundImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
            paddingYDesktop: 80,
            paddingYMobile: 64,
            overlayOpacity: 0.5,
            buttonUrl: ''
        }
    },

    stats_grid: {
        editor: StatsGridEditor,
        label: '數據指標',
        icon: '📊',
        category: 'basic',
        tier: 'free',
        defaultProps: {
            title: "Why Choose Us",
            description: "We bring years of experience and a passion for excellence to every project.",
            stats: [
                { value: "15+", label: "Years Experience" },
                { value: "200+", label: "Projects Completed" },
                { value: "50+", label: "Awards Won" },
                { value: "100%", label: "Client Satisfaction" }
            ],
            logos: [],
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    scrollable_cards: {
        editor: ScrollableCardsEditor,
        label: '滾動卡片',
        icon: '🃏',
        category: 'media',
        tier: 'free',
        defaultProps: {
            title: "Services we provide",
            services: [
                {
                    id: "01",
                    title: "Design",
                    description: "Creating beautiful and functional designs.",
                    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80"
                },
                {
                    id: "02",
                    title: "Development",
                    description: "Building robust and scalable solutions.",
                    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80"
                },
                {
                    id: "03",
                    title: "Marketing",
                    description: "Reaching your target audience effectively.",
                    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1000&q=80"
                }
            ],
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    portfolio_grid: {
        editor: PortfolioGridEditor,
        label: '作品集網格',
        icon: '🔳',
        category: 'media',
        tier: 'free',
        defaultProps: {
            title: "Selected Works",
            subtitle: "Explore our diverse portfolio of projects.",
            items: [
                {
                    id: "p1",
                    title: "Project Alpha",
                    category: "Design",
                    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
                    link: "#"
                },
                {
                    id: "p2",
                    title: "Project Beta",
                    category: "Development",
                    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80",
                    link: "#"
                },
                {
                    id: "p3",
                    title: "Project Gamma",
                    category: "Marketing",
                    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1000&q=80",
                    link: "#"
                },
                {
                    id: "p4",
                    title: "Project Delta",
                    category: "Strategy",
                    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
                    link: "#"
                }
            ],
            showViewAll: true,
            viewAllText: "View All Projects",
            viewAllUrl: "/portfolio",
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    threads_block: {
        editor: ThreadsBlockEditor,
        label: 'Threads 背景',
        icon: Sparkles,
        category: 'interactive',
        tier: 'growth',
        defaultProps: {
            title: "Interactive Threads",
            description: "Move your mouse to interact with the background.",
            color: [1, 1, 1],
            backgroundColor: '#000000',
            amplitude: 1,
            distance: 0,
            mobileAmplitude: 0.5,
            mobileDistance: 0,
            enableMouseInteraction: true,
            paddingYDesktop: 0,
            paddingYMobile: 0,
            titleColor: '#ffffff',
            descriptionColor: '#a1a1aa',
            primaryButtonLabel: '',
            primaryButtonLink: '',
            secondaryButtonLabel: '',
            secondaryButtonLink: ''
        }
    },
    'flowing-menu-block': {
        editor: FlowingMenuBlockEditor,
        label: '流動選單 (Flowing Menu)',
        icon: '🌊',
        category: 'interactive',
        tier: 'growth',
        defaultProps: {
            items: [
                { link: '#', text: 'Mojave', image: 'https://picsum.photos/600/400?random=1' },
                { link: '#', text: 'Sonoma', image: 'https://picsum.photos/600/400?random=2' },
                { link: '#', text: 'Monterey', image: 'https://picsum.photos/600/400?random=3' },
                { link: '#', text: 'Sequoia', image: 'https://picsum.photos/600/400?random=4' }
            ],
            speed: 15,
            textColor: '#ffffff',
            bgColor: '#060010',
            marqueeBgColor: '#ffffff',
            marqueeTextColor: '#060010',
            borderColor: '#ffffff',
            height: 600,
            paddingYDesktop: 0,
            paddingYMobile: 0
        }
    },
    'image-trail-block': {
        editor: ImageTrailEditor,
        label: '圖片軌跡 (Image Trail)',
        icon: '✨',
        category: 'interactive',
        tier: 'growth',
        defaultProps: {
            images: [
                'https://picsum.photos/id/287/300/300',
                'https://picsum.photos/id/1001/300/300',
                'https://picsum.photos/id/1025/300/300',
                'https://picsum.photos/id/1026/300/300',
                'https://picsum.photos/id/1027/300/300'
            ],
            variant: 1,
            height: 500,
            backgroundColor: 'transparent',
            paddingYDesktop: 0,
            paddingYMobile: 0
        }
    }
}

/**
 * 取得元件編輯器
 */
export function getComponentEditor(type: string): ComponentType<EditorProps> | null {
    return componentRegistry[type]?.editor || null
}

/**
 * 取得元件預設屬性
 */
export function getDefaultProps(type: string): Record<string, any> {
    return componentRegistry[type]?.defaultProps || {}
}

/**
 * 取得元件配置
 */
export function getComponentConfig(type: string): ComponentConfig | null {
    return componentRegistry[type] || null
}

/**
 * 依分類取得元件列表
 */
export function getComponentsByCategory(category: ComponentConfig['category']): Array<{ type: string; config: ComponentConfig }> {
    return Object.entries(componentRegistry)
        .filter(([, config]) => config.category === category)
        .map(([type, config]) => ({ type, config }))
}

/**
 * 取得所有元件類型
 */
export function getAllComponentTypes(): string[] {
    return Object.keys(componentRegistry)
}
