'use client'

import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ServiceItem {
    id: string
    title: string
    description: string
    image: string
}

interface ScrollableCardsProps {
    title?: string
    services?: ServiceItem[]
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
}

export function ScrollableCards({
    title = "Services we provide",
    services = [
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
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false
}: ScrollableCardsProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <section
            className="w-full"
            style={{
                paddingTop: `${isMobile ? paddingYMobile : paddingYDesktop}px`,
                paddingBottom: `${isMobile ? paddingYMobile : paddingYDesktop}px`
            }}
        >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end mb-8">
                <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-1">{title}</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto no-scrollbar gap-4 px-4 sm:px-6 lg:px-8 snap-x scroll-smooth pb-4 w-full"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {services.map((service, index) => (
                    <div key={index} className="w-[200px] md:w-[320px] flex-none snap-center first:pl-0 last:pr-4">
                        <div className="relative rounded-2xl overflow-hidden aspect-[3/4] mb-4 group cursor-pointer">
                            <img
                                src={service.image}
                                alt={service.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {service.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}
