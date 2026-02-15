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
    AppleCardsCarouselEditor
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
