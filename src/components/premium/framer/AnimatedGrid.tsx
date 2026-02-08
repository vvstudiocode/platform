import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GridItem {
    id: string
    title: string
    image: string
    link: string
    size?: 'small' | 'medium' | 'large'
}

interface AnimatedGridProps {
    items: GridItem[]
    columns?: number
}

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 50, damping: 20 }
    },
}

export function AnimatedGrid({ items, columns = 3 }: AnimatedGridProps) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className={cn(
                'grid grid-cols-1 md:grid-cols-2 gap-4 p-4',
                columns === 3 && 'lg:grid-cols-3',
                columns === 4 && 'lg:grid-cols-4'
            )}
        >
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    variants={itemVariant}
                    className={cn(
                        'relative group overflow-hidden rounded-xl aspect-[4/5] md:aspect-[3/4]',
                        item.size === 'large' && 'md:col-span-2 md:aspect-[16/9]'
                    )}
                >
                    <Link href={item.link} className="block w-full h-full relative">
                        {/* Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 will-change-transform"
                            style={{ backgroundImage: `url(${item.image})` }}
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-black font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                {item.title}
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    )
}
