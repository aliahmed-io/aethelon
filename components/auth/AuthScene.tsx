"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

function Monolith() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        // Slow continuous rotation
        meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;

        // Subtle mouse tracking parallax
        const targetX = (state.pointer.x * Math.PI) / 10;
        const targetY = (state.pointer.y * Math.PI) / 10;

        meshRef.current.rotation.x += 0.05 * (targetY - meshRef.current.rotation.x);
        meshRef.current.rotation.y += 0.05 * (targetX - meshRef.current.rotation.y);
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                {/* Elegant geometric shape */}
                <torusKnotGeometry args={[1.5, 0.4, 256, 64]} />
                <MeshTransmissionMaterial
                    backside
                    samples={8}
                    resolution={1024}
                    transmission={0.9}
                    thickness={0.5}
                    roughness={0.15}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    ior={1.5}
                    chromaticAberration={0.05}
                    anisotropy={0.1}
                    distortion={0.3}
                    distortionScale={0.3}
                    temporalDistortion={0.05}
                    color="#C9912B" /* Burnished Gold */
                    attenuationDistance={2}
                    attenuationColor="#ffffff"
                />
            </mesh>
        </Float>
    );
}

export default function AuthScene() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                {/* Dramatic cinematic lighting */}
                <ambientLight intensity={0.2} />
                <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={2} color="#ffffff" castShadow />
                <pointLight position={[-5, -5, -5]} intensity={1.5} color="#C9912B" />

                <Monolith />

                {/* Procedural environment provides realistic reflections without network requests */}
                <Environment resolution={256}>
                    <group rotation={[-Math.PI / 4, -0.3, 0]}>
                        <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
                        <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.1, 1]} />
                        <Lightformer rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
                        <Lightformer rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} />
                        <Lightformer color="#C9912B" intensity={2} rotation-y={Math.PI / 2} position={[-5, 2, -1]} scale={[20, 0.1, 1]} />
                    </group>
                </Environment>
            </Canvas>
        </div>
    );
}
