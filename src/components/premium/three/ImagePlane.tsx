'use client'

import { useRef, useState } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { TextureErrorBoundary } from './TextureErrorBoundary'

interface ImagePlaneProps {
    url: string
    position: [number, number, number]
    rotation: [number, number, number]
    width: number
    height: number
}

// 使用 useTexture 從 drei，有更好的錯誤處理
function ImagePlaneContent({ url, position, rotation, width, height }: ImagePlaneProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hasError, setHasError] = useState(false)

    // useTexture 會在 Suspense 下自動處理加載（包含 CORS）
    const texture = useTexture(url)

    // 如果加載失敗，顯示灰色
    if (hasError || !texture) {
        return (
            <mesh ref={meshRef} position={position} rotation={rotation}>
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial color="#666666" />
            </mesh>
        )
    }

    return (
        <mesh ref={meshRef} position={position} rotation={rotation}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
    )
}

export function ImagePlane(props: ImagePlaneProps) {
    return (
        <TextureErrorBoundary
            fallback={
                <mesh position={props.position} rotation={props.rotation}>
                    <planeGeometry args={[props.width, props.height]} />
                    <meshBasicMaterial color="#666666" />
                </mesh>
            }
        >
            <ImagePlaneContent {...props} />
        </TextureErrorBoundary>
    )
}
