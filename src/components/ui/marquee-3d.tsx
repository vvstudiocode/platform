"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Image from "next/image";

export const ThreeDMarquee = ({
    images,
    className,
}: {
    images: string[];
    className?: string;
}) => {
    // Filter out valid images
    const validImages = images.filter((img) => img && img.trim() !== "");
    if (validImages.length === 0) return null;

    // Split images into 4 columns
    const chunkedImages = [];
    const chunkSize = Math.ceil(validImages.length / 4);
    for (let i = 0; i < 4; i++) {
        chunkedImages.push(validImages.slice(i * chunkSize, (i + 1) * chunkSize));
    }

    return (
        <div
            className={cn(
                "relative flex h-[600px] w-full items-center justify-center overflow-hidden md:h-[800px]",
                className
            )}
        >
            <div
                className="relative flex h-full w-full items-center justify-center gap-4 overflow-hidden [perspective:1000px] [transform-style:preserve-3d]"
            >
                <div
                    className="flex h-full w-full justify-center gap-4 [transform:rotateX(20deg)__rotateY(10deg)__rotateZ(-20deg)__scale(1.3)]"
                    style={{
                        transform: "rotateX(20deg) rotateY(10deg) rotateZ(-20deg) scale(1.3)",
                    }}
                >
                    {chunkedImages.map((columnImages, colIndex) => (
                        <div
                            key={colIndex}
                            className="relative flex h-full w-60 flex-col gap-4 overflow-hidden"
                        >
                            <MarqueeColumn
                                images={columnImages}
                                reverse={colIndex % 2 === 1}
                                duration={20 + colIndex * 5}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MarqueeColumn = ({
    images,
    reverse = false,
    duration = 20,
}: {
    images: string[];
    reverse?: boolean;
    duration?: number;
}) => {
    // Triple the images to ensure smooth looping
    const duplicatedImages = [...images, ...images, ...images];

    return (
        <motion.div
            initial={{ y: reverse ? -500 : 0 }}
            animate={{ y: reverse ? 0 : -500 }}
            transition={{
                repeat: Infinity,
                ease: "linear",
                duration: duration,
            }}
            className="flex flex-col gap-4"
        >
            {duplicatedImages.map((src, index) => (
                <div
                    key={index}
                    className="relative h-40 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800"
                >
                    <Image
                        src={src}
                        alt={`Marquee image ${index}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100px, 200px"
                    />
                </div>
            ))}
        </motion.div>
    );
};
