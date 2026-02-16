'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortfolioItem {
    image: string
    title: string
    isWide?: boolean
}

interface ArchPortfolioProps {
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

export function ArchPortfolio({
    title = "Our Portfolio of Pioneering Design",
    subtitle = "Explore our selected works that demonstrate our commitment to design excellence.",
    items = [
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
    showViewAll = true,
    viewAllText = "See More Projects",
    viewAllUrl = "#",
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false
}: ArchPortfolioProps) {
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
                {items.map((item, index) => (
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
