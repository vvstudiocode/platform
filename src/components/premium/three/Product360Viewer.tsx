'use client'

import React from 'react'
import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF, Html, useProgress } from '@react-three/drei'
import * as THREE from 'three'

interface Product360ViewerProps {
    modelUrl?: string // .glb or .gltf
    imageSequence?: string[] // For sprite-based 360
    autoRotate?: boolean
    scale?: number
}

function Loader() {
    const { progress } = useProgress()
    return <Html center>{progress.toFixed(1)} % loaded</Html>
}

// Model Viewer Component
function Model({ url, scale = 1 }: { url: string; scale: number }) {
    const { scene } = useGLTF(url)
    return <primitive object={scene} scale={[scale, scale, scale]} />
}

// Sprite/Image Sequence Viewer Component (Simple implementation mapping image to plane)
// For true 360 image sequence, we would change texture on drag. 
// Implementing basic texture loader fallback if no model.

export function Product360Viewer({
    modelUrl,
    autoRotate = true,
    scale = 1,
}: Product360ViewerProps) {
    if (!modelUrl) {
        return <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 text-gray-400">No Model URL provided</div>
    }

    return (
        <div className="w-full h-[400px] md:h-[600px] relative bg-gray-50 rounded-xl overflow-hidden">
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                <React.Suspense fallback={<Loader />}>
                    <Stage environment="city" intensity={0.6}>
                        <Model url={modelUrl} scale={scale} />
                    </Stage>
                </React.Suspense>
                <OrbitControls
                    autoRotate={autoRotate}
                    enableZoom={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-gray-600 pointer-events-none">
                360° View
            </div>
        </div>
    )
}
