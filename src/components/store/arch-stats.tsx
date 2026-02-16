'use client'

import React from 'react'

interface StatItem {
    value: string
    label: string
}

interface ArchStatsProps {
    title?: string
    description?: string
    stats?: StatItem[]
    logos?: string[]
    backgroundColor?: string
    textColor?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
}

export function ArchStats({
    title = "About Company",
    description = "At Apex Architects, we believe that architecture is more than just buildings; it's about creating environments that enhance human experience.",
    stats = [
        { value: "25+", label: "Years of Excellence" },
        { value: "500+", label: "Projects Completed" },
        { value: "98%", label: "Client Retention" },
        { value: "15+", label: "Countries Active" }
    ],
    logos = [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAigGH9th4zRtRl_Ha6q2Yckyv46Mq4lak0gxb5HIKXI-Kn-Ozl9edZUwZTGc2sMZj1fRhAUqJ0skn8bU54VoX7aNcG-5VBtroAnXaRK8-x-bMCE6Oas8BPf2ysxpsjlrhp-46WlV_lA9JO7QShVbhZzCNBnj2RKgpcmXoOo_fL9aWCFvJVlJzdVRDSo-SGsLQXYdj_gSQ2YIo2kqVizBiipE5-r373RBW1WComGBYpdCZkwT8aXfelVWmVAwa8PrNDvtZuRggHc98",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBfbrcK9gtOCFP-HFLonTTVFT79WZ8oY6Mm6vqiB5c7g5d56ZA7TkHEGxt6EXNJXphMjMrP6voCcW4dqcsZOwuuTf9FgMYaclrCPRK38xBmke9bM18Oc4okrfTpfN5na0Pv_4tVKoRmambe0H40JPcY0kLPbhvf5DerZq3YfRXU7QFJPxrWO2jc5ZGOvHgEXodqy3Z7bqdPZI4yrWjizLt4nggGjvkqdQhADIKqxCDCBNKCrGcEPXVD2FzTsdtlsJSvU9E3h3QdcOg",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCD7l-oUmmQVRx6wITvizrgnl1BVj_fZGv-u_azr5dTyfhe6M8i9Iv7zcCEfQcVdjJOyzWeu9quI6__8x_IQQ_5dk0MVm2v3QGBvkLkTGziumq-9LQJPJzU3QrZYZcglG_VTMZXFmoSp74dr7V3L5Z7_kGCpN0ZCJFAMFBWL1ZJmvDAQ5aB4ZRInn7GB5ktwW8utruZjolbmAGpii4Sr5ztcIky0x39EFRJyOiOQvtOWxjbG5l2Qj-VmX1Kx9OWLyB8GZyBThkHGV0"
    ],
    backgroundColor = "transparent",
    textColor = "#1A1A1A",
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile = false
}: ArchStatsProps) {
    return (
        <section
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-t-[40px]"
            style={{
                backgroundColor,
                color: textColor,
                paddingTop: `${isMobile ? paddingYMobile : paddingYDesktop}px`,
                paddingBottom: `${isMobile ? paddingYMobile : paddingYDesktop}px`
            }}
        >
            <div className="mb-10">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">{title}</h2>
                <p className="text-sm md:text-base opacity-70 leading-relaxed max-w-2xl">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12">
                {stats.map((stat, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-800 rounded-2xl">
                        <p className="font-display text-3xl font-bold mb-1">{stat.value}</p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {logos && logos.length > 0 && (
                <div className="flex flex-wrap justify-between items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    {logos.map((logo, index) => (
                        <div key={index} className="h-6 md:h-8 flex items-center justify-center">
                            <img
                                src={logo}
                                alt={`Partner ${index + 1}`}
                                className="h-full object-contain max-w-[120px]"
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
