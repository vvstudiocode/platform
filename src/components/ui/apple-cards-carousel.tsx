"use client";

import React, {
    useEffect,
    useState,
    createContext,
} from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CarouselProps {
    items: React.JSX.Element[];
    initialScroll?: number;
}

type Card = {
    src: string;
    title: string;
    category: string;
    content?: React.ReactNode;
};

export const CarouselContext = createContext<{
    onCardClose: (index: number) => void;
    currentIndex: number;
}>({
    onCardClose: () => { },
    currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
    const carouselRef = React.useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (carouselRef.current) {
            carouselRef.current.scrollLeft = initialScroll;
            // checkScrollability(); // No longer needed as scroll buttons are removed
        }
    }, [initialScroll]);

    const checkScrollability = () => {
        // This function is no longer needed as scroll buttons are removed
        // and thus canScrollLeft/Right states are not used.
    };

    const handleCardClose = (index: number) => {
        if (carouselRef.current) {
            const cardWidth = isMobile() ? 230 : 384; // (md:w-96)
            const gap = isMobile() ? 4 : 8;
            const scrollPosition = (cardWidth + gap) * (index + 1);
            carouselRef.current.scrollTo({
                left: scrollPosition,
                behavior: "smooth",
            });
            setCurrentIndex(index);
        }
    };

    const isMobile = () => {
        return typeof window !== "undefined" && window.innerWidth < 768;
    };

    return (
        <CarouselContext.Provider
            value={{ onCardClose: handleCardClose, currentIndex }}
        >
            <div className="relative w-full">
                <div
                    className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth [scrollbar-width:none]"
                    ref={carouselRef}
                    onScroll={checkScrollability}
                >
                    {/* Removed the absolute right-0 div as it was likely for scroll indicators/buttons */}

                    <div
                        className={cn(
                            "flex flex-row justify-start gap-4 pl-4",
                            "max-w-7xl mx-auto" // limit width
                        )}
                    >
                        {items.map((item, index) => (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 20,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        duration: 0.5,
                                        delay: 0.2 * index,
                                        ease: "easeOut",
                                    },
                                }}
                                key={"card" + index}
                                className="last:pr-[5%] md:last:pr-[33%]"
                            >
                                {item}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </CarouselContext.Provider>
    );
};

export const Card = ({
    card,
    layout = false,
}: {
    card: Card;
    index: number; // Keep index for potential future use or if it's implicitly used by parent
    layout?: boolean;
}) => {
    return (
        <motion.div
            layoutId={layout ? `card-${card.title}` : undefined}
            className={cn(
                "rounded-3xl bg-gray-100 dark:bg-neutral-900 h-80 w-60 md:h-[30rem] md:w-96 overflow-hidden flex flex-col items-start justify-start relative z-10 shrink-0",
            )}
        >
            <div className="absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-30 pointer-events-none" />
            <div className="relative z-40 p-8 h-full flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                    <motion.p
                        layoutId={layout ? `category-${card.category}` : undefined}
                        className="text-white text-sm md:text-base font-medium font-sans text-left bg-black/50 px-3 py-1 rounded-full w-fit backdrop-blur-sm"
                    >
                        {card.category}
                    </motion.p>
                    <div className="mt-2">
                        <motion.h3
                            layoutId={layout ? `title-${card.title}` : undefined}
                            className="text-white text-xl md:text-3xl font-semibold max-w-xs text-left [text-wrap:balance] font-sans leading-tight mt-2 drop-shadow-md"
                        >
                            {card.title}
                        </motion.h3>
                    </div>
                </div>
            </div>
            <BlurImage
                src={card.src}
                alt={card.title}
                className="object-cover absolute z-10 inset-0 h-full w-full"
            />
        </motion.div>
    );
};

export const BlurImage = ({
    height,
    width,
    src,
    className,
    alt,
    ...rest
}: any) => {
    const [isLoading, setLoading] = useState(true);
    const imgRef = React.useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (imgRef.current?.complete) {
            setLoading(false);
        }
    }, []);

    return (
        <img
            ref={imgRef}
            className={cn(
                "transition duration-300",
                isLoading ? "blur-sm" : "blur-0",
                className
            )}
            onLoad={() => setLoading(false)}
            src={src}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            alt={alt ? alt : "Background of a beautiful view"}
            {...rest}
        />
    );
};

export function AppleCardsCarousel({
    items,
    paddingYDesktop = 0,
    paddingYMobile = 0,
}: {
    items: Card[];
    paddingYDesktop?: number;
    paddingYMobile?: number;
}) {

    const cards = items.map((card, index) => (
        <Card key={card.src} card={card} index={index} />
    ));

    return (
        <div
            className="w-full h-full"
            style={{
                paddingTop: paddingYMobile,
                paddingBottom: paddingYMobile,
            }}
        >
            <style jsx>{`
                @media (min-width: 768px) {
                    .apple-carousel-container {
                        padding-top: ${paddingYDesktop}px !important;
                        padding-bottom: ${paddingYDesktop}px !important;
                    }
                }
            `}</style>
            <div className="apple-carousel-container" style={{ paddingTop: paddingYMobile, paddingBottom: paddingYMobile }}>
                <Carousel items={cards} />
            </div>
        </div>
    );
}
