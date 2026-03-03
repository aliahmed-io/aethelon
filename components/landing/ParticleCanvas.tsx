'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useScrollStore } from '@/lib/stores/scrollStore';
import { useGLTF } from '@react-three/drei';

function Particles() {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { scrollProgress } = useScrollStore();
    const count = 10000;

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Load GLTF Models
    const { scene: chairScene } = useGLTF('/landing_chair.glb');
    const { scene: lampScene } = useGLTF('/landing_lamp.glb');
    const { scene: decorScene } = useGLTF('/landing_decor.glb');

    const buildTransform = (scene: THREE.Group, count: number, scaleFactor: number, xOffset: number, yOffset: number) => {
        const positions: THREE.Vector3[] = [];
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const geometry = (child as THREE.Mesh).geometry;
                const posAttr = geometry.attributes.position;
                if (posAttr) {
                    child.updateMatrixWorld(true);
                    for (let i = 0; i < posAttr.count; i++) {
                        const p = new THREE.Vector3().fromBufferAttribute(posAttr as THREE.BufferAttribute, i);
                        p.applyMatrix4(child.matrixWorld);
                        positions.push(p);
                    }
                }
            }
        });

        const box = new THREE.Box3();
        positions.forEach(p => box.expandByPoint(p));
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? scaleFactor / maxDim : 1;

        const sampled = [];
        for (let i = 0; i < count; i++) {
            if (positions.length > 0) {
                const p = positions[Math.floor(Math.random() * positions.length)].clone();
                p.sub(center).multiplyScalar(scale);
                p.x += xOffset;
                p.y += yOffset;
                sampled.push(p);
            } else {
                sampled.push(new THREE.Vector3(xOffset, yOffset, 0));
            }
        }
        return sampled;
    };

    const targetPositions1 = useMemo(() => buildTransform(chairScene, count, isMobile ? 50 : 85, isMobile ? 0 : 45, -5), [chairScene, count, isMobile]);
    const targetPositions2 = useMemo(() => buildTransform(lampScene, count, isMobile ? 50 : 85, isMobile ? 0 : 45, -5), [lampScene, count, isMobile]);
    const targetPositions3 = useMemo(() => buildTransform(decorScene, count, isMobile ? 85 : 160, isMobile ? 0 : 115, -5), [decorScene, count, isMobile]);

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

            // Stage 1: Chaos (0 to 0.1)
            // Stage 2: Chaos -> Chair (0.1 to 0.152)
            // Stage 3: Hold Chair (0.152 to 0.255)
            // Stage 4: Chair -> Lamp (0.255 to 0.325)
            // Stage 5: Hold Lamp (0.325 to 0.422)
            // Stage 6: Lamp -> Decor (0.422 to 0.492)
            // Stage 7: Hold Decor (0.492 to 0.55)
            // Stage 8: Decor -> Sphere (0.55 to 0.62)
            // Stage 9: Hold Sphere (>0.62)
            let finalX = x;
            let finalY = y;
            let finalZ = z;

            const pos1 = targetPositions1[i % targetPositions1.length];
            const pos2 = targetPositions2[i % targetPositions2.length];
            const pos3 = targetPositions3[i % targetPositions3.length];

            if (currentScroll < 0.1) {
                finalX = x; finalY = y; finalZ = z;
            } else if (currentScroll < 0.152) {
                const progress = (currentScroll - 0.1) / (0.152 - 0.1);
                finalX = THREE.MathUtils.lerp(x, pos1.x, progress);
                finalY = THREE.MathUtils.lerp(y, pos1.y, progress);
                finalZ = THREE.MathUtils.lerp(z, pos1.z, progress);
            } else if (currentScroll < 0.255) {
                finalX = pos1.x; finalY = pos1.y; finalZ = pos1.z;
            } else if (currentScroll < 0.325) {
                const progress = (currentScroll - 0.255) / (0.325 - 0.255);
                finalX = THREE.MathUtils.lerp(pos1.x, pos2.x, progress);
                finalY = THREE.MathUtils.lerp(pos1.y, pos2.y, progress);
                finalZ = THREE.MathUtils.lerp(pos1.z, pos2.z, progress);
            } else if (currentScroll < 0.422) {
                finalX = pos2.x; finalY = pos2.y; finalZ = pos2.z;
            } else if (currentScroll < 0.492) {
                const progress = (currentScroll - 0.422) / (0.492 - 0.422);
                finalX = THREE.MathUtils.lerp(pos2.x, pos3.x, progress);
                finalY = THREE.MathUtils.lerp(pos2.y, pos3.y, progress);
                finalZ = THREE.MathUtils.lerp(pos2.z, pos3.z, progress);
            } else if (currentScroll < 0.55) {
                finalX = pos3.x; finalY = pos3.y; finalZ = pos3.z;
            } else if (currentScroll < 0.62) {
                const progress = (currentScroll - 0.55) / (0.62 - 0.55);
                finalX = THREE.MathUtils.lerp(pos3.x, sphereX, progress);
                finalY = THREE.MathUtils.lerp(pos3.y, sphereY, progress);
                finalZ = THREE.MathUtils.lerp(pos3.z, sphereZ, progress);
            } else {
                finalX = sphereX; finalY = sphereY; finalZ = sphereZ;
            }

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
        <div className="fixed inset-0 z-[4] pointer-events-none">
            <Canvas camera={{ position: [0, 0, 100], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <React.Suspense fallback={null}>
                    <Particles />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
