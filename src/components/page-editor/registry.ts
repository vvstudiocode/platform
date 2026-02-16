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

    ArchStatsEditor,
    ArchServicesEditor,
    ArchPortfolioEditor
} from './editors'

export interface ComponentConfig {
    editor: ComponentType<EditorProps>
    label: string
    icon: string
    category: 'basic' | 'media' | 'product' | 'interactive'
    defaultProps: Record<string, any>
}

export const componentRegistry: Record<string, ComponentConfig> = {
    // === 基礎元件 ===
    hero: {
        editor: HeroEditor,
        label: 'Hero Banner',
        icon: '🎯',
        category: 'basic',
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
        defaultProps: {
            title: '熱門商品',
            productIds: [],
            autoplay: true,
            interval: 5
        }
    },

    // === 進階互動元件 ===
    showcase_slider: {
        editor: ShowcaseSliderEditor,
        label: 'Showcase Slider',
        icon: '🎬',
        category: 'interactive',
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
        icon: '🖼️',
        category: 'interactive',
        defaultProps: {
            images: [],
            speed: 30,
            direction: 'left',
            pauseOnHover: true,
            backgroundColor: '#ffffff',
            imageHeight: 100,
            imageGap: 32
        }
    },
    image_testimonials: {
        editor: ImageTestimonialsEditor,
        label: '動態見證牆',
        icon: 'message-square',
        category: 'media',
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

    arch_stats: {
        editor: ArchStatsEditor,
        label: '建築數據',
        icon: '📊',
        category: 'basic',
        defaultProps: {
            title: "About Company",
            description: "At Apex Architects, we believe that architecture is more than just buildings; it's about creating environments that enhance human experience.",
            stats: [
                { value: "25+", label: "Years of Excellence" },
                { value: "500+", label: "Projects Completed" },
                { value: "98%", label: "Client Retention" },
                { value: "15+", label: "Countries Active" }
            ],
            logos: [
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAigGH9th4zRtRl_Ha6q2Yckyv46Mq4lak0gxb5HIKXI-Kn-Ozl9edZUwZTGc2sMZj1fRhAUqJ0skn8bU54VoX7aNcG-5VBtroAnXaRK8-x-bMCE6Oas8BPf2ysxpsjlrhp-46WlV_lA9JO7QShVbhZzCNBnj2RKgpcmXoOo_fL9aWCFvJVlJzdVRDSo-SGsLQXYdj_gSQ2YIo2kqVizBiipE5-r373RBW1WComGBYpdCZkwT8aXfelVWmVAwa8PrNDvtZuRggHc98",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBfbrcK9gtOCFP-HFLonTTVFT79WZ8oY6Mm6vqiB5c7g5d56ZA7TkHEGxt6EXNJXphMjMrP6voCcW4dqcsZOwuuTf9FgMYaclrCPRK38xBmke9bM18Oc4okrfTpfN5na0Pv_4tVKoRmambe0H40JPcY0kLPbhvf5DerZq3YfRXU7QFJPxrWO2jc5ZGOvHgEXodqy3Z7bqdPZI4yrWjizLt4nggGjvkqdQhADIKqxCDCBNKCrGcEPXVD2FzTsdtlsJSvU9E3h3QdcOg",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCD7l-oUmmQVRx6wITvizrgnl1BVj_fZGv-u_azr5dTyfhe6M8i9Iv7zcCEfQcVdjJOyzWeu9quI6__8x_IQQ_5dk0MVm2v3QGBvkLkTGziumq-9LQJPJzU3QrZYZcglG_VTMZXFmoSp74dr7V3L5Z7_kGCpN0ZCJFAMFBWL1ZJmvDAQ5aB4ZRInn7GB5ktwW8utruZjolbmAGpii4Sr5ztcIky0x39EFRJyOiOQvtOWxjbG5l2Qj-VmX1Kx9OWLyB8GZyBThkHGV0"
            ],
            paddingYDesktop: 64,
            paddingYMobile: 32,
            backgroundColor: 'transparent'
        }
    },
    arch_services: {
        editor: ArchServicesEditor,
        label: '建築服務',
        icon: '🛠️',
        category: 'media',
        defaultProps: {
            title: "Services we provide",
            services: [
                {
                    id: "01",
                    title: "Arch Design",
                    description: "From initial concept development and schematic design for unique structures.",
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuATqNKzokp4OAnY_zjD5UP27GxSET-095CL8C_6Xr4UIY4oX6ZjQTZPKAmWNV_InQEGULE5fYJlY4Uuf0g-QS23q_0n9ZEpcIPvCPoCeyxJlZX5QteDEJsfV3QqBQTscUHySioMmv82oizPWdo5woBb-dMZIBDxfNy7JjjSN-6jlYoqNmtY_J97G8ivscYRbkpb2WidGA2Tg6NXzjWKlZDnJF9hVXt1O4UGDcklfEOjDJcKYfuV4roDeH_quT5zj2M9x6FPzSMAjYc"
                },
                {
                    id: "02",
                    title: "Interior Design",
                    description: "Creating cohesive interior spaces that reflect your style and lifestyle.",
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbJ6ibw2wCMVnna0ye7gYst70ysSTl2ma7ZaJ4_U7qUm8qeT1Q5YHJ3y9P1Z2vcU9NYlg9dzezeabaTeAduBEaS0LHw4k0bkLqxk5Wi5qKOn2F9TWp2lwxbdQVczOo8OljIzEhde3231o9fAJw8EkJ2fcU0Ewqvq_l9HO6tfu7qlXwDGi2_H4Gbt0TtV6Sr7dsQlKppGfGeT8ZWjP9-1eJ8iEhxy15lVvG4EZ5ei2P6bbx7hB9aCTxs78GoTZZMli0Va3voW05qss"
                },
                {
                    id: "03",
                    title: "Urban Planning",
                    description: "Designing the spaces between buildings & outdoors for better communities.",
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIxkBrahcWg6l1YBgbo8lam4dgPgbjRrR6IWvTk0Zc-m7fzqaySd4Yh0USplEbZCgiGXQHOdNNCl3HAw11rACqzq3jzlJxsE1zuIbQBosXdj6-fLlbJYw8C5PLbHjdKbl7NHDyGFU1GWTTMaVUBokCS5-LlRpx06Sn9Q4Jj1vCf7fyDdFc9Lpb-ayeYgR9GJjIpKuBxcxnVP-B8iBpwPPcBAbxrx-4OM7HIvWZkKYQKi-4Qr_kYjelpUWQeIFKAfgRfhDjJoaRqf8"
                }
            ],
            paddingYDesktop: 64,
            paddingYMobile: 32
        }
    },
    arch_portfolio: {
        editor: ArchPortfolioEditor,
        label: '建築作品集',
        icon: '🖼️',
        category: 'media',
        defaultProps: {
            title: "Our Portfolio of Pioneering Design",
            subtitle: "Explore our selected works that demonstrate our commitment to design excellence.",
            items: [
                {
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEVyFpT-JipTnmroNn-stYHhIHl0Nl7Wwy4r53p990qKM4v0rmemmBpk_XSFO18tKUSijgyClNBP1dRj2UMstQyzf2otLpuDXZgyFB94CdncxQAx6YRrMnd2KeTFrvysHbrQWiaUGHPLg0HB3xBNjrr0D4zI_kACrTBi-A7sPIYvoAfEOvtw8lR9hFyHAjH-_RSwFx-s0a_squ4gkQjJ9a_IQcsYA4Ew6M3ksL9ralBpvFQlI1gUbWJ4wbSItPSZHx7geWU1GaOSw",
                    title: "NEW YORK OFFICE"
                },
                {
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMdWEIX5IF1Hsg-_w_o3jDUxtUnflLECNDIZJPXBawUSZ8ULU0bC-4_G6uBeTrdU1tmo49BE_8mPKGai3_jQufgjf76Gu2Bwm2Idy-VAR8VYKlZuDc3o0GVNqI8Cwe3BIGxVihxweRmq6QRnJyY-C91-m_k4OIAGATBeGrVUOousFx-lVydPLpah0QiSwccirEhn4szi4qIMad4GRcQU_IntIXqDi0dLkvQHeYxkhI01yPPUfy7pvREiRU9D5y2gppEHjL6MCGBBw",
                    title: "COMMERCIAL RESTAURANT"
                },
                {
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlJ_67SuI0MphSAV5QKMsbhF65_ieThoviOsOQi0JmpPjfVhMapDMnYDz_NFxCxNXFsMEzVnASftsBuSY_EceVRkIJJoVyFCOkHp8oqg_CnLvOxIGZdfLGOrtfqQXA6z6YG6kILOCIwqPXFpBUx75M8R_ztfBPF9_sb3JR14O-NbvkkImHUn353YmkeWbb9NH-xKXzhbQCbozMoMFpjFwj6U9354haWCXXYNMOSOE0mPZSDKBbeM-n6JjSu2XMnGLdEVOv0XYfwYU",
                    title: "PRIVATE LUXURY HOUSE",
                    isWide: true
                },
                {
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2aY0gzHwKhojrIcw8v4GFm_odQf6-gB53CJl6B0Eq7d_ZRtEzF0JuXZHYBtwr8V4xIW_Q-QjUhkSy25kgcwPOFoH51HFcvMbW1_cJFhRJshPGrumMhcXMQrKnITya0KCLGc8m-eTlJ6dntyn9o-ZnxwtX_jQWwuQ_ruPVEiIamNA0o-9Rz_or_x4xQQXgJCDwrLTeKtvoFsC2YdIlVyNiEpi7NAw5pJ9yuCsxEcrkkP6xWlzx2AO5MgOZwnj_PZ4iPT8Wbty15dU",
                    title: "HOTEL ROOMS"
                }
            ],
            showViewAll: true,
            viewAllText: "See More Projects",
            viewAllUrl: "#",
            paddingYDesktop: 64,
            paddingYMobile: 32
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
