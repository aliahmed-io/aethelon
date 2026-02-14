'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useScrollStore } from '@/lib/stores/scrollStore';

function Particles() {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { scrollProgress } = useScrollStore();
    const count = 2000;

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate random initial positions
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame(() => {
        const currentMesh = mesh.current;
        if (!currentMesh) return;

        // Rotate entire system based on scroll
        currentMesh.rotation.y = scrollProgress * Math.PI * 0.5;
        currentMesh.rotation.z = scrollProgress * 0.2;

        particles.forEach((particle, i) => {
            const { factor, speed, xFactor, yFactor, zFactor } = particle;
            particle.t += speed / 2; // Update time
            const t = particle.t;

            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            // Morph logic based on scroll (simplified for now)
            // At scroll 0: Swirl
            // At scroll 1: Sphere-ish
            const currentScroll = scrollProgress || 0;

            const x = (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10;
            const y = (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10;
            const z = (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10;

            // Lerp to sphere shape based on scroll
            const sphereRadius = 30;
            const sphereX = Math.sin(i) * sphereRadius;
            const sphereY = Math.cos(i) * sphereRadius;
            const sphereZ = Math.tan(i) * sphereRadius; // messy sphere for effect

            const finalX = THREE.MathUtils.lerp(x, sphereX, currentScroll);
            const finalY = THREE.MathUtils.lerp(y, sphereY, currentScroll);
            const finalZ = THREE.MathUtils.lerp(z, sphereZ, currentScroll);

            dummy.position.set(finalX, finalY, finalZ);
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            currentMesh.setMatrixAt(i, dummy.matrix);
        });

        currentMesh.instanceMatrix.needsUpdate = true;
    });

    return (
        <>
            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <dodecahedronGeometry args={[0.2, 0]} />
                <meshStandardMaterial
                    color="#C9912B"
                    emissive="#C9912B"
                    emissiveIntensity={0.5}
                    roughness={0.5}
                    metalness={1}
                />
            </instancedMesh>
        </>
    );
}

export default function ParticleCanvas() {
    return (
        <div className="fixed inset-0 z-0 bg-background pointer-events-none">
            <Canvas camera={{ position: [0, 0, 100], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Particles />
            </Canvas>
        </div>
    );
}
