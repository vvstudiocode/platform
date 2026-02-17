import { cn } from '@/lib/utils'

// NewsHero Component
interface NewsHeroProps {
    title?: string
    subtitle?: string
    number?: string
    unit?: string
    note?: string
    descriptionTitle?: string
    description?: string
    images?: string[] // Array of 9 images
    date?: string
    brandText?: string
    primaryColor?: string
    backgroundColor?: string
    textColor?: string
    paddingYDesktop?: number
    paddingYMobile?: number
    isMobile?: boolean
}

export function NewsHero({
    title = "SPORTS",
    subtitle = "入 夏 特 輯",
    number = "89",
    unit = "折",
    note = "(品項自由搭配)",
    descriptionTitle = "Lookbook",
    description = "Life is contradictory is movement. Once the contradictory eliminate motion stops life will be over if you want strong running it if you want to fit running it thanks to his persistent physical exercise he looks healthy with white hair and a ruddy complexion.",
    images = [],
    date = "JUN.01 - JUN.07",
    brandText = "NOTHING BUT YOU X LYCRA®",
    primaryColor = "#5A7ABC",
    backgroundColor = "#FFFDF7",
    textColor = "#333333",
    paddingYDesktop = 64,
    paddingYMobile = 32,
    isMobile
}: NewsHeroProps) {
    // Fill images to ensure we have 9 slots, handling empty/null values
    const displayImages = Array.from({ length: 9 }).map((_, i) => {
        const img = images?.[i]
        return (img && img.trim() !== "") ? img : "https://placehold.co/300x400/e2e8f0/e2e8f0?text=IMG"
    })

    return (
        <section
            className="w-full font-display transition-colors duration-300"
            style={{
                backgroundColor: backgroundColor,
                color: textColor,
                paddingTop: isMobile ? paddingYMobile : paddingYDesktop,
                paddingBottom: isMobile ? paddingYMobile : paddingYDesktop,
            }}
        >
            {/* Top Bar */}
            <div
                className="w-full flex justify-between items-center px-6 py-4 text-xs tracking-widest border-b"
                style={{ borderColor: `${primaryColor}33`, color: primaryColor }}
            >
                <span>{brandText}</span>
                <span>{date}</span>
            </div>

            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {/* --- MOBILE LAYOUT (Stacked, Centered) --- */}
                {/* Visible only on screens smaller than lg (1024px) */}
                <div className={cn("flex flex-col mb-12 min-h-[80vh] justify-between relative", isMobile ? "flex" : "lg:hidden")}>
                    {/* Text Content */}
                    <div className="flex flex-col justify-between items-center text-center flex-grow p-6">

                        {/* Top Section */}
                        <div className="flex flex-col items-center w-full">
                            <h1
                                className="font-serif text-[8rem] leading-[0.8] mb-4 text-center w-full break-normal"
                                style={{ color: primaryColor }}
                            >
                                {title}
                            </h1>
                            <p
                                className="tracking-[0.5em] text-xl font-light"
                                style={{ color: primaryColor }}
                            >
                                {subtitle}
                            </p>
                        </div>

                        {/* Middle Section (Discount) */}
                        <div
                            className="flex items-center justify-center my-12"
                            style={{ color: primaryColor }}
                        >
                            {/* Number */}
                            <span className="font-serif text-[10rem] leading-none -ml-4">{number}</span>

                            {/* Unit & Note Column */}
                            <div className="flex flex-col items-baseline justify-center ml-4 h-full pt-8">
                                <span className="text-5xl font-serif mb-2">{unit}</span>
                                <span className="text-sm opacity-70 whitespace-pre-line leading-tight text-left">
                                    {note?.replace('(', '').replace(')', '').split('').join('\n') ||
                                        ['品', '項', '自', '由', '搭', '配'].join('\n')}
                                </span>
                            </div>
                        </div>

                        {/* Bottom Section (Description/Lookbook) */}
                        <div className="w-full text-center pb-8 space-y-4">
                            <div>
                                <h4
                                    className="uppercase tracking-[0.2em] font-bold text-lg"
                                    style={{ color: primaryColor }}
                                >
                                    {descriptionTitle}
                                </h4>
                            </div>
                            <p className="text-xs opacity-70 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
                                {description}
                            </p>
                            <div className="w-8 h-1 mx-auto rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        </div>
                    </div>

                    {/* Image Grid (Mobile) - reduced size or kept as is? 
                        The prompt implies refining the layout, likely the "card" part. 
                        We'll keep the image grid below but maybe add some margin. 
                    */}
                    <div className="w-full px-2">
                        <div className="grid grid-cols-3 gap-2">
                            {displayImages.slice(0, 9).map((img, i) => (
                                <div key={i} className="aspect-[3/4] overflow-hidden bg-gray-100">
                                    <img
                                        alt={`Gallery ${i}`}
                                        className="w-full h-full object-cover"
                                        src={img}
                                        style={{ filter: i % 2 === 0 ? undefined : 'grayscale(100%)' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- DESKTOP LAYOUT (Split, Text Right) --- */}
                {/* Visible only on lg screens (1024px) and up */}
                <div className={cn("grid-cols-12 gap-12 mb-24", isMobile ? "hidden" : "hidden lg:grid")}>
                    {/* Left Column: Text Content (Right Aligned) */}
                    <div className="col-span-5 flex flex-col items-end text-right pr-12 pt-12">
                        <h3
                            className="text-sm tracking-widest uppercase mb-2"
                            style={{ color: primaryColor }}
                        >
                            New Arrivals
                        </h3>
                        <h1
                            className="font-serif text-8xl mb-2"
                            style={{ color: primaryColor }}
                        >
                            {title}
                        </h1>
                        <p
                            className="tracking-[0.3em] mb-12 text-lg"
                            style={{ color: primaryColor }}
                        >
                            {subtitle}
                        </p>

                        <div
                            className="flex items-baseline justify-end mb-12"
                            style={{ color: primaryColor }}
                        >
                            <span className="text-xl mr-2">新品3件</span>
                            <span className="font-serif text-9xl leading-none">{number}</span>
                            <div className="flex flex-col items-start ml-2">
                                <span className="text-2xl font-serif">{unit}</span>
                                <span className="text-xs opacity-70">{note}</span>
                            </div>
                        </div>

                        <div className="w-full max-w-md text-right">
                            <h4
                                className="uppercase tracking-widest font-bold mb-4 text-sm"
                                style={{ color: primaryColor }}
                            >
                                {descriptionTitle}
                            </h4>
                            <p className="text-[0.6rem] leading-relaxed opacity-70 uppercase tracking-wide">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Image Grid */}
                    <div className="col-span-7">
                        <div className="grid grid-cols-3 gap-2">
                            {displayImages.slice(0, 9).map((img, i) => (
                                <div key={i} className="aspect-[3/4] overflow-hidden bg-gray-100">
                                    <img
                                        alt={`Gallery ${i}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                        src={img}
                                        style={{ filter: i % 2 === 0 ? undefined : 'grayscale(100%)' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
