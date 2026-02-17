
import { type ComponentConfig, componentRegistry } from './registry'

export interface TemplateComponent {
    type: string
    props: Record<string, any>
    label?: string // Optional override for display
}

export interface Template {
    id: string
    name: string
    description: string
    category: 'retail' | 'service' | 'portfolio' | 'blog' | 'other'
    components: TemplateComponent[]
}

const childClothingTemplate: Template = {
    id: 'child-clothing',
    name: '童裝風格 (Child Clothing)',
    description: '溫暖大地色系，適合嬰幼兒服飾、玩具或親子選物店。',
    category: 'retail',
    components: [
        {
            type: 'hero_composition',
            label: '主視覺 (Hero)',
            props: {
                title: 'earth friendly products\nfor your little chicke.',
                subtitle: '',
                description: '',
                buttonText: 'Shop Now',
                buttonUrl: '#',
                images: [
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDrAsj85yk9PL5AEyAA_hGGhFX-0L1tkNZOfp1jYCrXusugWbqxq5oxn4uk6PjYoDpCnl1ClYp9-lzzIXjTl-jSXAJ_6zkQ0pgdu0oLcZWQiQQy25JfG4yol5PYqR_FhTpIVlNUZ5PI4lIeibYJ01sv-46eeOxMdr7-18uMSGSj7sQS5JO0TUJ1gb9nDmlxcnRH_f23I854VDW1_TojCftMKf8b2BCOtHuFlL-LEyehfvmeijdOnFTwzbwzrkEj0t2THjt5wyvpsk-v'
                ],
                paddingYDesktop: 64,
                paddingYMobile: 32,
                backgroundColor: '#F5EFE6', // Soft warm beige from template
                textColor: '#8B5E3C'       // Earthy reddish-brown
            }
        },
        {
            type: 'image_card_grid',
            label: '分類網格 (Categories)',
            props: {
                title: 'shop by category',
                headerButtonText: '',
                headerButtonUrl: '',
                columns: 3,
                cards: [
                    {
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdamSEk9UkGU-BLDqxjUh-bUAEegrM7iB4XSpYhYJp8urlMKcXYU4qmTGtF9ns5V1bOjl3RszGuDKDCRudbJE3kJk1-GmZ57HOFTmgohJzJcySwNpYmUaZ-ElgO_tpy0Pqtz_i2SM1Yrh3FjwEu7OiwOST7bFomNrJl5BmiiiVvv6Sf9vFUd-_DWGgVYHtPJP-h76XthXY7ajjAn0eZRyFjQD0T_mSX1lcNvA9kojVBn5umybv-RdBU4J8xo7v2GYb_rBLGGDVQka4',
                        title: 'CLOTHES',
                        subtitle: '',
                        link: '#'
                    },
                    {
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeq8l-ySIW7fw17qV5Tym1HoifHDv-sBXTS06nQgRHL2L1C4MBaCHWsLAnPPmwts2WHz660O-qxp5zHQdpbslES7kowdQig4IoWnEuUdYkWEQ9rTDjXBZ0h5K4M82SQeeDEKNduQhMZ58TgjaZJOs9cd1bOKXANwkTlYHK-OCMh7xpgaJuyXsKZWrdbq16NP4Ipqt_tgiQqLJmG1ZepSX40sXM3NkK69ltYpPhD3WFKhaptpVtZ0vcHPArPurU2JnuGIXVnMO2twK0',
                        title: 'TOYS',
                        subtitle: '',
                        link: '#'
                    },
                    {
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA48-559_jziXJpXw2oONw2MajRK1MvwPPTC3R08bGSmNv85JsHH4PrMlWWVB4soc58li6nEke4USuamdyL2b3Pyc01pMoMdzka-woHWP_KQ95G6n9139eDj3cQCjByoB5BDcZOTvK2OWBjWeDB5HljPIqeCvoji7czmgk-HMArMDwzq1j9caMNSXH6jLHu_M36UY-Ynn3oIWGX2CngqMaZQVYIxPlJBNazQbyplT-2xI805jsQUUn2HNHVDl0CE7jxa5RGs3d_pa5j',
                        title: 'ESSENTIALS',
                        subtitle: '',
                        link: '#'
                    }
                ],
                paddingYDesktop: 80,
                paddingYMobile: 40,
                backgroundColor: '#ffffff'
            }
        },
        {
            type: 'image_card_grid', // Simulating product grid for visual fidelity without requiring DB products
            label: '新品推薦 (New Arrivals)',
            props: {
                title: 'new arrivals',
                headerButtonText: '',
                columns: 4,
                cards: [
                    {
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD188jmeWOqJXMd8L29U2RjuhMLR8VuDl6oytELk1xniHMrtjTChiKP1WMc62U-maBsVIYjHAyC3A7Wz-t6YtYaEj6GzQksdT4AHUy6KMYBlScAcABL3RpiZ72IcjAY2kl0waXBtxmi2-4YJszotPYetChjf5v4JEEoygnKBhQBW9PBlzoHjMZoJizN_5AwCTvoaAYkg6_qkyb2fh8GmyoRsnFG-jYj1ugavVdaBmclLhQdlbxnkICQ8fThCN69COifOZ5m2b9GLS2a',
                        title: 'Bamboo Swaddle',
                        subtitle: '$26',
                        link: '#'
                    },
                    {
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAilxYNEh7m9qM6IRTBAyOej54XFUcFa_enae8APzgDqqmexcPVLqM-Z2taDjpPE-tl2-qitPUC72DhJZyci7-oFwPanE5KSypKvZXLR9caFGEeo8EuI570GO47c_EI5zkAVTBPOrqdgmyTZBAGunmicszv2aS9CACso3IkmManWmli92qE9wdIZMr2XfnacQkdTfRO1QHOeYjakeyL7JyL7UmYAVmr2HFv3KFMx-w9yo2Y9-m4GYuJqYGtc30ra7_g7uxhVtHBS2vq',
                        title: 'Knit Pants - Rust',
                        subtitle: '$32',
                        link: '#'
                    },
                    {
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNeR_o_7v8VNcBBeXIaEOegB1Od8FZETVOguJVkF9Hq8Hi2WoOD0LcFVm3gtB7qDul35rR78I5npqJ7ew3osWfhymBsZWGWKSTbnVXy5TOl-2edBLCXMycjZNA0DNS5Nqq3WBH8BXF-QXXRNDBEUcvSog5Mz84YGoD70Yxp0LgrVP67RVvbs2u_rZZXDeLE1OsarA8ilUeWexU06Sq_w9SzDA5qD0LXGHjW5pRKgKnOvmraQ-r4t-3rYRgb47mmtnMO-t8ap_Ur3uk',
                        title: 'Long Sleeve Onesie',
                        subtitle: '$38',
                        link: '#'
                    },
                    {
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwY8F95AOBx5b4ZV8takVb9dOCzgnycgKaNNMq3lDHI52FxCXwtxSj5xDxsVceQpeorP3WvQcAvq1hfFOqia2UQwnRBq2HzEqgdbDR5Qooqgj_tLxMs7HM99T8_16SqQxHcJKqwgeFfi1zm9BiCPB2WtF3hwFkdOpndAK-r8xIyXg9GhCpY4gelOWRbrdWLfBQ4hBD_9VnAC0zEEjRyGZ_Fw8yB1vqZRfCUuUamgsS4xQloWwXAdALVJsX-IdKp2sut1aaH2vdhax_',
                        title: 'Ruffle Dress - Blush',
                        subtitle: '$42',
                        link: '#'
                    }
                ],
                paddingYDesktop: 80,
                paddingYMobile: 40,
                backgroundColor: '#FFFCF8'
            }
        },
        {
            type: 'image_text',
            label: '促銷區塊 (Promo)',
            props: {
                layout: 'right', // Text on left (image right) - Wait, template shows text on right/left? Template section "Love Box" has text on right, image on left. So layout 'right' usually means image on right? Or text alignment? 
                // Let's assume layout='left' means image on left.
                // ImageText defaults: 'left' = image left.
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeq8l-ySIW7fw17qV5Tym1HoifHDv-sBXTS06nQgRHL2L1C4MBaCHWsLAnPPmwts2WHz660O-qxp5zHQdpbslES7kowdQig4IoWnEuUdYkWEQ9rTDjXBZ0h5K4M82SQeeDEKNduQhMZ58TgjaZJOs9cd1bOKXANwkTlYHK-OCMh7xpgaJuyXsKZWrdbq16NP4Ipqt_tgiQqLJmG1ZepSX40sXM3NkK69ltYpPhD3WFKhaptpVtZ0vcHPArPurU2JnuGIXVnMO2twK0', // Reusing toys image as gift box or use icon if possible. The template has a "Gift Card" icon. ImageText supports image. 
                // Let's use a nice gift image from unsplash if I can't find the exact one in the HTML (it's an SVG).
                // I'll stick to a placeholder gift image.
                title: 'looking for the perfect gift?',
                content: 'Thoughtfully curated by Chicke owner, Stephanie. No two boxes are the same. Love Box makes the perfectly unique gift for expectant parents or yourself.',
                buttonText: 'Shop Now',
                buttonUrl: '#',
                backgroundColor: '#ffffff', // Gingham pattern is hard, use white for now
                paddingYDesktop: 100,
                paddingYMobile: 60
            }
        },
        {
            type: 'features',
            label: '特色介紹 (Features)',
            props: { // Features component props needs checking
                title: 'why shop chicke?',
                items: [
                    {
                        title: 'Earth Friendly, Always',
                        description: 'Sustainability is at our core. We select only products that respect our planet.',
                        icon: 'Globe' // Need to map material icons to lucide
                    },
                    {
                        title: 'Back to the Basics',
                        description: 'Simple designs, natural fibers, and timeless quality for everyday use.',
                        icon: 'Baby'
                    },
                    {
                        title: 'Something for Every Chicke',
                        description: 'A curated collection for babies, toddlers, and the spaces they grow in.',
                        icon: 'Heart'
                    }
                ],
                paddingYDesktop: 80,
                paddingYMobile: 40,
                backgroundColor: '#ffffff'
            }
        },
        {
            type: 'newsletter_banner',
            label: '訂閱優惠 (Newsletter)',
            props: {
                title: 'Join our little community!',
                subtitle: 'Subscribe to get 10% off your first order and stay updated on new arrivals.',
                placeholder: 'Enter your email',
                buttonText: 'Subscribe Now',
                backgroundColor: '#F5EFE6',
                textColor: '#8B5E3C',
                paddingYDesktop: 80,
                paddingYMobile: 40
            }
        }
    ]
}

const fashionStyleTemplate: Template = {
    id: 'fashion-style',
    name: '服飾風格 (Fashion Style)',
    description: '質感簡約的服飾版型，適合運動休閒、時尚服飾品牌。',
    category: 'retail',
    components: [
        {
            type: 'news_hero',
            label: '九宮格Hero',
            props: {
                title: 'SPORTS',
                subtitle: '入 夏 特 輯',
                number: '89',
                unit: '折',
                note: '(品項自由搭配)',
                brandText: 'NOTHING BUT YOU X LYCRA®',
                date: 'JUN.01 - JUN.07',
                primaryColor: '#5A7ABC',
                backgroundColor: '#FFFDF7',
                textColor: '#333333',
                images: [
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
                    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600',
                    'https://images.unsplash.com/photo-1539109132382-381bb3f1c2b3?w=600',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600',
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600',
                    'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=600',
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
                    'https://images.unsplash.com/photo-1488161628813-244a2ceba245?w=600'
                ]
            }
        },
        {
            type: 'product_list',
            label: '本日熱門 (Trending)',
            props: {
                title: 'Trending Now',
                columns: 4,
                productIds: []
            }
        },
        {
            type: 'news_feature',
            label: '上身特色 (TOP)',
            props: {
                sectionTitle: 'TOP',
                brandText: 'NOTHING BUT YOU X LYCRA®',
                primaryColor: '#5A7ABC',
                backgroundColor: '#FFFDF7',
                textColor: '#333333',
                mainProduct: {
                    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
                    brand: "LYCRA®",
                    title: "可調式運動BRA TOP",
                    note: "(象牙白、淺藍)",
                    colors: ['#E8E4D9', '#A5B3CE']
                },
                subProducts: [
                    {
                        image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400",
                        brand: "LYCRA®",
                        title: "基礎方領運動BRA TOP",
                        note: "(淺藍、卡其)",
                        colors: ['#A5B3CE', '#D2B48C']
                    },
                    {
                        image: "https://images.unsplash.com/photo-1539109132382-381bb3f1c2b3?w=400",
                        brand: "LYCRA®",
                        title: "V領後交叉運動BRA TOP",
                        note: "(象牙白、卡其)",
                        colors: ['#E8E4D9', '#D2B48C']
                    },
                    {
                        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
                        brand: "LYCRA®",
                        title: "平口後交叉運動BRA TOP",
                        note: "(淺藍、象牙白)",
                        colors: ['#A5B3CE', '#E8E4D9']
                    }
                ]
            }
        },
        {
            type: 'product_list',
            label: '店長推薦 (Staff Pick)',
            props: {
                title: 'Staff Pick',
                columns: 3,
                productIds: []
            }
        },
        {
            type: 'news_feature',
            label: '下身特色 (BOTTOM)',
            props: {
                sectionTitle: 'BOTTOM',
                brandText: 'NOTHING BUT YOU X LYCRA®',
                primaryColor: '#5A7ABC',
                backgroundColor: '#FFFDF7',
                textColor: '#333333',
                mainProduct: {
                    image: "https://images.unsplash.com/photo-1506169894395-36397e4abcbe?w=800",
                    brand: "LYCRA®",
                    title: "高腰親膚九分運動褲",
                    note: "(深藍、深灰)",
                    colors: ['#2D3E50', '#4A4A4A']
                },
                subProducts: [
                    {
                        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
                        brand: "LYCRA®",
                        title: "美型修身運動長褲",
                        note: "(深灰)",
                        colors: ['#4A4A4A']
                    },
                    {
                        image: "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=400",
                        brand: "LYCRA®",
                        title: "親膚奶油感九分褲",
                        note: "(象牙白)",
                        colors: ['#E8E4D9']
                    },
                    {
                        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
                        brand: "LYCRA®",
                        title: "經典美型壓力褲",
                        note: "(黑、深藍)",
                        colors: ['#000000', '#2D3E50']
                    }
                ]
            }
        },
        {
            type: 'social_wall',
            label: '社群美牆',
            props: {
                title: '#NothingButYou',
                subtitle: 'Share your moments with us on Instagram',
                username: '@NBY_OFFICIAL',
                profileUrl: '#',
                followButtonText: 'FOLLOW US',
                backgroundColor: '#FFFDF7',
                textColor: '#333333'
            }
        }
    ]
}

export const templates: Template[] = [
    childClothingTemplate,
    fashionStyleTemplate
]

