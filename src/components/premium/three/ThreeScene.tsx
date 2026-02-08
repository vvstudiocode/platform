'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ImagePlane } from './ImagePlane'

interface CarouselSceneProps {
    images: { url: string; alt?: string }[]
    radius: number
    itemWidth: number
    itemHeight: number
    rotationSpeed: number
    autoRotate: boolean
}

export function CarouselScene({
    images,
    radius,
    itemWidth,
    itemHeight,
    rotationSpeed,
    autoRotate,
}: CarouselSceneProps) {
    const groupRef = useRef<THREE.Group>(null)

    // 計算每張圖片的位置（環狀排列）
    const imagePositions = useMemo(() => {
        const count = images.length
        const angleStep = (Math.PI * 2) / count

        return images.map((img, index) => {
            const angle = angleStep * index
            const x = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius
            const y = 0

            return {
                url: img.url,
                position: [x, y, z] as [number, number, number],
                rotation: [0, -angle, 0] as [number, number, number],
            }
        })
    }, [images, radius])

    // 自動旋轉動畫
    useFrame((state, delta) => {
        if (groupRef.current && autoRotate) {
            groupRef.current.rotation.y += delta * rotationSpeed
        }
    })

    return (
        <group ref={groupRef}>
            {imagePositions.map((item, index) => (
                <ImagePlane
                    key={index}
                    url={item.url}
                    position={item.position}
                    rotation={item.rotation}
                    width={itemWidth}
                    height={itemHeight}
                />
            ))}
        </group>
    )
}
