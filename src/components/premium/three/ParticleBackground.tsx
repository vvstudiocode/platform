'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleBackgroundProps {
    count?: number
    color?: string
    speed?: number
}

function Particles({ count = 100, color = '#e11d48', speed = 0.5 }: ParticleBackgroundProps) {
    const mesh = useRef<THREE.Points>(null)
    const light = useRef<THREE.PointLight>(null)

    // Generate random particles
    const particles = useMemo(() => {
        const temp = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20
            const y = (Math.random() - 0.5) * 20
            const z = (Math.random() - 0.5) * 20
            temp[i * 3] = x
            temp[i * 3 + 1] = y
            temp[i * 3 + 2] = z
        }
        return temp
    }, [count])

    useFrame((state) => {
        if (!mesh.current) return

        const time = state.clock.getElapsedTime() * speed

        // Rotate entire system
        mesh.current.rotation.x = Math.sin(time / 4) * 0.2
        mesh.current.rotation.y = Math.sin(time / 2) * 0.2

        // Mouse interaction (if desired, currently simple ambient motion)
        // const mouseX = state.mouse.x * 2
        // const mouseY = state.mouse.y * 2
        // mesh.current.rotation.x += (mouseY - mesh.current.rotation.x) * 0.05
    })

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                    args={[particles, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color={color}
                sizeAttenuation={true}
                depthWrite={false}
                transparent={true}
                opacity={0.8}
            />
        </points>
    )
}

export function ParticleBackground({ count = 200, color = '#666', speed = 0.2 }: ParticleBackgroundProps) {
    return (
        <div className="absolute inset-0 w-full h-full -z-10 bg-gradient-to-b from-gray-50 to-white">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <Particles count={count} color={color} speed={speed} />
            </Canvas>
        </div>
    )
}
