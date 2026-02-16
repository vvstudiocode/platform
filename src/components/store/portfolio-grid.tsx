'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortfolioItem {
    id?: string
    image: string
    title: string
    category?: string
    link?: string
    isWide?: boolean
}

interface PortfolioGridProps {
    title?: string
    subtitle?: string
    items?: PortfolioItem[]
    showViewAll?: boolean
    viewAllText?: string
    viewAllUrl?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
}

export function PortfolioGrid({
    title = "Selected Works",
    subtitle = "Explore our diverse portfolio of residential, commercial, and public projects.",
    items = [
        {
            id: "p1",
            title: "Modern Minimalist Villa",
            category: "Residential",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuATqNKzokp4OAnY_zjD5UP27GxSET-095CL8C_6Xr4UIY4oX6ZjQTZPKAmWNV_InQEGULE5fYJlY4Uuf0g-QS23q_0n9ZEpcIPvCPoCeyxJlZX5QteDEJsfV3QqBQTscUHySioMmv82oizPWdo5woBb-dMZIBDxfNy7JjjSN-6jlYoqNmtY_J97G8ivscYRbkpb2WidGA2Tg6NXzjWKlZDnJF9hVXt1O4UGDcklfEOjDJcKYfuV4roDeH_quT5zj2M9x6FPzSMAjYc",
            link: "#"
        },
        {
            id: "p2",
            title: "Eco-Friendly Office Complex",
            category: "Commercial",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbJ6ibw2wCMVnna0ye7gYst70ysSTl2ma7ZaJ4_U7qUm8qeT1Q5YHJ3y9P1Z2vcU9NYlg9dzezeabaTeAduBEaS0LHw4k0bkLqxk5Wi5qKOn2F9TWp2lwxbdQVczOo8OljIzEhde3231o9fAJw8EkJ2fcU0Ewqvq_l9HO6tfu7qlXwDGi2_H4Gbt0TtV6Sr7dsQlKppGfGeT8ZWjP9-1eJ8iEhxy15lVvG4EZ5ei2P6bbx7hB9aCTxs78GoTZZMli0Va3voW05qss",
            link: "#"
        },
        {
            id: "p3",
            title: "City Public Library",
            category: "Public",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIxkBrahcWg6l1YBgbo8lam4dgPgbjRrR6IWvTk0Zc-m7fzqaySd4Yh0USplEbZCgiGXQHOdNNCl3HAw11rACqzq3jzlJxsE1zuIbQBosXdj6-fLlbJYw8C5PLbHjdKbl7NHDyGFU1GWTTMaVUBokCS5-LlRpx06Sn9Q4Jj1vCf7fyDdFc9Lpb-ayeYgR9GJjIpKuBxcxnVP-B8iBpwPPcBAbxrx-4OM7HIvWZkKYQKi-4Qr_kYjelpUWQeIFKAfgRfhDjJoaRqf8",
            link: "#"
        },
        {
            id: "p4",
            title: "Riverside Apartments",
            category: "Residential",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeHQZdXp0A000zRMqsFCBvL_gF24kchyxqnWPLJy0Gd-mLBNfSCqTA3SBFK-ku_LkWcltvdzf8SXl75kvYAQVh0gt3_xiDcAv_6INCNwhwY1y9skSrcrqARpyXBj_WyodxJJY7Vy3MCOS1lCvN-Fog4u81gPU9fHkPqiMhFB8HVrDLjau4mJUV6DWzAsfxPL0qKELsxxfdJXQHATpCHdwim5rDa7nAAWGv7DJyA--7cK_iCehIOU--PXN0t7vCtXb1sABvQERlFH4",
            link: "#"
        }
    ],
    showViewAll = true,
    viewAllText = "View All Projects",
    viewAllUrl = "/portfolio",
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false
}: PortfolioGridProps) {
    return (
        <section
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            style={{
                paddingTop: `${isMobile ? paddingYMobile : paddingYDesktop}px`,
                paddingBottom: `${isMobile ? paddingYMobile : paddingYDesktop}px`
            }}
        >
            <div className="mb-10">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">{title}</h2>
                <p className="text-sm md:text-base opacity-70 leading-relaxed">
                    {subtitle}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {items.map((item: PortfolioItem, index: number) => (
                    <div
                        key={index}
                        className={cn(
                            "relative rounded-2xl overflow-hidden group w-full",
                            item.isWide ? "col-span-2 aspect-[16/10]" : "col-span-1 aspect-[3/4]"
                        )}
                    >
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <span className="absolute bottom-4 right-4 md:bottom-6 md:right-6 text-[10px] md:text-xs text-white font-medium tracking-wide uppercase">
                            {item.title}
                        </span>
                    </div>
                ))}

                {showViewAll && (
                    <div className="relative aspect-square md:aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex flex-col items-center">
                            <Plus className="w-8 h-8 md:w-10 md:h-10 mb-2 opacity-30" />
                            <p className="text-[10px] md:text-xs font-semibold opacity-50 uppercase">VIEW ALL PROJECTS</p>
                        </div>
                    </div>
                )}
            </div>

            <button className="w-full mt-10 py-4 border border-gray-900 dark:border-white rounded-xl font-semibold hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all">
                {viewAllText}
            </button>
        </section>
    )
}
