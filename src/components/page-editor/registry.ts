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
    ImageTrailEditor,
    BeforeAfterEditor,
    ScrollRevealBlockEditor,
    ShinyTextEditor,
    GradientTextEditor,
    RotatingTextEditor,
    NewsHeroEditor,
    NewsFeatureEditor,
    SocialWallEditor,
    SpacerEditor,
    Carousel3DEditor,
    TextParallaxContentEditor,
    BentoGridEditor
} from './editors'
import { Sparkles, ScrollText, MoveVertical } from 'lucide-react'

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
    bento_grid: {
        editor: BentoGridEditor,
        label: '便當盒特點區塊',
        icon: '',
        category: 'basic',
        tier: 'free',
        defaultProps: {
            title1: '高度客製化',
            value1: '100%',
            title2: '預設安全防護',
            icon2: '',
            title3: '極速效能體驗',
            graphic3: '',
            title4: '數據洞察與分析',
            icon4: '',
            chart4: '',
            title5: '守護您的摯愛',
            icon5: '',
            avatar1Name: 'Likeur',
            avatar1Image: '',
            avatar2Name: 'M. Irung',
            avatar2Image: '',
            avatar3Name: 'B. Ng',
            avatar3Image: '',
            paddingYDesktop: 64,
            paddingYMobile: 32
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
            items: [],
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    spacer: {
        editor: SpacerEditor,
        label: '空白間距',
        icon: 'MoveVertical', // We imported MoveVertical in the previous step (although that edit might have failed due to the index export error, let's assume it succeeded or I will fix it)
        category: 'basic',
        tier: 'free',
        defaultProps: {
            heightDesktop: 50,
            heightMobile: 30,
            backgroundColor: 'transparent'
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
    news_hero: {
        editor: NewsHeroEditor,
        label: '九宮格Hero',
        icon: '📰',
        category: 'media',
        tier: 'free',
        defaultProps: {
            title: 'SPORTS',
            subtitle: '入 夏 特 輯',
            description: 'Life is contradictory is movement. Once the contradictory eliminate motion stops life will be over if you want strong running it if you want to fit running it thanks to his persistent physical exercise he looks healthy with white hair and a ruddy complexion.',
            number: '89',
            unit: '折',
            note: '(品項自由搭配)',
            brandText: 'NOTHING BUT YOU X LYCRA®',
            date: 'JUN.01 - JUN.07',
            primaryColor: '#5A7ABC',
            backgroundColor: '#FFFDF7',
            textColor: '#333333',
            paddingYDesktop: 64,
            paddingYMobile: 32,
            images: Array(9).fill('').map((_, i) => `https://placehold.co/300x400/e2e8f0/e2e8f0?text=IMG${i + 1}`)
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
    news_feature: {
        editor: NewsFeatureEditor,
        label: '商品特色',
        icon: '✨',
        category: 'product',
        tier: 'free',
        defaultProps: {
            sectionTitle: 'TOP',
            brandText: 'NOTHING BUT YOU X LYCRA®',
            primaryColor: '#5A7ABC',
            backgroundColor: '#FFFDF7',
            textColor: '#333333',
            mainProduct: {
                image: "https://placehold.co/600x800",
                brand: "LYCRA®",
                title: "可調式運動BRA TOP",
                note: "(象牙白、淺藍)",
                colors: ['#E8E4D9', '#A5B3CE']
            },
            subProducts: [
                {
                    image: "https://placehold.co/300x400",
                    brand: "LYCRA®",
                    title: "基礎方領運動BRA TOP",
                    note: "(淺藍、卡其)",
                    colors: ['#A5B3CE', '#D2B48C']
                },
                {
                    image: "https://placehold.co/300x400",
                    brand: "LYCRA®",
                    title: "V領後交叉運動BRA TOP",
                    note: "(象牙白、卡其)",
                    colors: ['#E8E4D9', '#D2B48C']
                },
                {
                    image: "https://placehold.co/300x400",
                    brand: "LYCRA®",
                    title: "平口後交叉運動BRA TOP",
                    note: "(象牙白、卡其)",
                    colors: ['#E8E4D9', '#D2B48C']
                }
            ]
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
            text: 'OMO網站平台',
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
    rotating_text: {
        editor: RotatingTextEditor,
        label: '輪替文字',
        icon: '🔄',
        category: 'interactive',
        tier: 'free',
        defaultProps: {
            prefix: 'OMO網站平台',
            texts: ['is very good', 'is amazing', 'is powerful'],
            rotationInterval: 2000,
            splitBy: 'characters',
            staggerFrom: 'last',
            fontSizeDesktop: 40,
            fontSizeMobile: 24,
            fontWeight: 800,
            textAlign: 'center',
            color: '#000000',
            backgroundColor: '#cyan-300',
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
    carousel_3d: {
        editor: Carousel3DEditor,
        label: '3D 圓環輪播',
        icon: '🎡',
        category: 'interactive',
        tier: 'growth',
        defaultProps: {
            images: [
                { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', alt: '精品珠飾' },
                { url: 'https://images.unsplash.com/photo-1573408339375-f99b29ff7011?w=800', alt: '經典鑽戒' },
                { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', alt: '優雅耳環' },
                { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', alt: '精緻手鍊' },
                { url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800', alt: '亮眼項鍊' },
                { url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800', alt: '純淨鑽石' },
                { url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800', alt: '時尚配飾' },
                { url: 'https://images.unsplash.com/photo-1515562085055-8a96608199ca?w=800', alt: '珠寶組合' },
            ],
            autoRotate: true,
            rotationDuration: '32s',
            cardWidth: '17.5em',
            perspective: '35em',
            gap: '0.5em',
            paddingYDesktop: 64,
            paddingYMobile: 32
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
    social_wall: {
        editor: SocialWallEditor,
        label: '社群美牆',
        icon: '📸',
        category: 'media',
        tier: 'free',
        defaultProps: {
            title: '#NothingButYou',
            subtitle: 'Share your moments with us on Instagram',
            username: '@NBY_OFFICIAL',
            profileUrl: '#',
            followButtonText: 'FOLLOW US',
            backgroundColor: '#FFFDF7',
            textColor: '#333333',
            posts: [
                {
                    id: '1',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
                    username: '@jennie_fit',
                    caption: '素材真的太舒服了，完全不想脫下來！',
                    likes: 1240
                },
                {
                    id: '2',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
                    username: '@daily_ootd',
                    caption: '日常穿搭也很適合，顏色超美！',
                    likes: 856
                },
                {
                    id: '3',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?w=600',
                    username: '@pilates_lover',
                    caption: '做瑜伽的時候完全不會卡卡，大推！',
                    likes: 2100
                },
                {
                    id: '4',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1544435216-182ac79f0352?w=600',
                    username: '@minji_ss',
                    caption: '包裝很有質感，送禮也很適合。',
                    likes: 1540
                }
            ]
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
    text_parallax_content: {
        editor: TextParallaxContentEditor,
        label: '視差滾動內容',
        icon: 'ScrollText',
        category: 'interactive',
        tier: 'growth',
        defaultProps: {
            items: [
                {
                    imgUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
                    subheading: "OMO 全通路整合",
                    heading: "打造無縫零售體驗",
                    contentTitle: "數據驅動的會員運營",
                    contentDescription1: "整合線上與線下會員數據，精準描繪消費者輪廓。透過全方位的數據分析，洞察顧客需求，提供個人化的購物體驗，有效提升會員黏著度與終身價值。",
                    contentDescription2: "從流量獲取到會員留存，我們提供完整的數位轉型解決方案。讓您的品牌在數位浪潮中站穩腳步，創造持續性的營收成長。",
                    contentButtonText: "了解更多",
                    contentButtonLink: "",
                    contentBackgroundColor: "#ffffff",
                    contentButtonColor: "#171717",
                }
            ],
            buttonText: '了解更多',
            paddingYDesktop: 0,
            paddingYMobile: 0,
            backgroundColor: 'transparent'
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
            title: 'OMO 網站平台',
            description: '打造您專屬的品牌電商，提供一站式解決方案',
            color: [1, 1, 1],
            backgroundColor: '#000000',
            amplitude: 1,
            distance: 0,
            mobileAmplitude: 0.5,
            mobileDistance: 0,
            centerX: 0.5,
            enableMouseInteraction: true,
            paddingYDesktop: 120,
            paddingYMobile: 80,
            fontSizeDesktop: 60,
            fontSizeMobile: 36,
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
    },
    before_after: {
        editor: BeforeAfterEditor,
        label: 'Before/After',
        icon: '↔️',
        category: 'interactive',
        tier: 'growth',
        defaultProps: {
            beforeImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
            afterImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&grayscale', // Same image but different effect for demo
            beforeLabel: 'Before',
            afterLabel: 'After',
            sliderColor: '#ffffff',
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    scroll_reveal: {
        editor: ScrollRevealBlockEditor,
        label: 'Scroll Reveal',
        icon: ScrollText,
        category: 'interactive',
        tier: 'growth',
        defaultProps: {
            items: [
                {
                    id: '1',
                    title: '專業品質',
                    description: '我們堅持使用最高品質的材料與工藝，為您打造經得起時間考驗的優質產品。每一個細節都經過精心設計與嚴格把關。',
                    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
                    backgroundColor: '#e8f4f8'
                },
                {
                    id: '2',
                    title: '客製化服務',
                    description: '根據您的需求量身打造專屬方案。從初步諮詢到最終交付，我們提供全程客製化服務，確保完美符合您的期待。',
                    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
                    backgroundColor: '#fff5e6'
                },
                {
                    id: '3',
                    title: '快速交付',
                    description: '高效的作業流程讓我們能在最短時間內完成您的訂單，同時保持最高品質標準。準時交付是我們對客戶的承諾。',
                    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80',
                    backgroundColor: '#f0f4e8'
                }
            ]
        }
    },
    shiny_text: {
        editor: ShinyTextEditor,
        label: '閃亮文字 (Shiny Text)',
        icon: '✨',
        category: 'interactive',
        tier: 'free',
        defaultProps: {
            text: 'OMO網站平台',
            speed: 2,
            disabled: false,
            color: '#b5b5b5',
            shineColor: '#ffffff',
            spread: 120,
            direction: 'left',
            yoyo: false,
            pauseOnHover: false,
            fontSizeDesktop: 16,
            fontSizeMobile: 14,
            fontWeight: 400,
            textAlign: 'center',
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    gradient_text: {
        editor: GradientTextEditor,
        label: '漸變文字 (Gradient Text)',
        icon: '🌈',
        category: 'basic',
        tier: 'free',
        defaultProps: {
            text: 'OMO網站平台',
            colors: ['#5227FF', '#FF9FFC', '#B19EEF'],
            animationSpeed: 8,
            showBorder: false,
            direction: 'horizontal',
            pauseOnHover: false,
            yoyo: true,
            fontSizeDesktop: 16,
            fontSizeMobile: 14,
            textAlign: 'center',
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
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
