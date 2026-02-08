'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { CarouselScene } from './ThreeScene'
import type { ThreeCarouselProps } from './types'

export default function ThreeCarousel({
    images = [],
    rotationSpeed = 0.2,
    radius = 5,
    itemWidth = 3,
    itemHeight = 2,
    backgroundColor = '#000000',
    autoRotate = true,
}: ThreeCarouselProps) {
    if (!images || images.length === 0) {
        return (
            <div
                className="w-full flex items-center justify-center text-white"
                style={{
                    height: 'calc(100vh - 64px)',
                    backgroundColor,
                }}
            >
                <p>請新增圖片</p>
            </div>
        )
    }

    return (
        <div
            className="w-full relative"
            style={{
                height: 'calc(100vh - 64px)',
                backgroundColor,
            }}
        >
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />

                {/* 環境光 */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />

                <Suspense fallback={null}>
                    <CarouselScene
                        images={images}
                        radius={radius}
                        itemWidth={itemWidth}
                        itemHeight={itemHeight}
                        rotationSpeed={rotationSpeed}
                        autoRotate={autoRotate}
                    />
                </Suspense>

                {/* 滑鼠/觸控控制 */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={5}
                    maxDistance={20}
                />
            </Canvas>

            {/* 載入提示 */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                拖曳旋轉 · 滾輪縮放
            </div>
        </div>
    )
}
