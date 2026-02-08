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
    TiltedScrollGalleryEditor,
    ProductListEditor,
    ProductCategoryEditor,
    ProductCarouselEditor,
    AnimatedTextEditor
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
    tilted_scroll_gallery: {
        editor: TiltedScrollGalleryEditor,
        label: '傾斜滾動圖庫',
        icon: '📷',
        category: 'interactive',
        defaultProps: {
            title: '',
            subtitle: '',
            images: [],
            columns: 3,
            rotateX: 20,
            rotateZ: -10,
            scale: 1.5,
            speed: 15
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
