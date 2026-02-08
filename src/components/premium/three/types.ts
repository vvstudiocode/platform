export interface ThreeCarouselProps {
    images: { url: string; alt?: string }[]
    rotationSpeed?: number
    radius?: number
    itemWidth?: number
    itemHeight?: number
    backgroundColor?: string
    autoRotate?: boolean
}

export interface ThreeCarouselItem {
    url: string
    alt?: string
    position: [number, number, number]
    rotation: [number, number, number]
}
