'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useScrollStore } from '@/lib/stores/scrollStore';
import { useGLTF } from '@react-three/drei';

function Particles() {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { scrollProgress } = useScrollStore();
    const count = 5000;

    const [windowWidth, setWindowWidth] = useState(1024);

    useEffect(() => {
        const checkWidth = () => setWindowWidth(window.innerWidth);
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    const responsiveT = useMemo(() => {
        return Math.min(Math.max((windowWidth - 400) / (1024 - 400), 0), 1);
    }, [windowWidth]);

    const bps = useMemo(() => {
        // Breakpoint thresholds
        // Mobile: User requested timings
        const bpsMobile = [0.100, 0.150, 0.195, 0.290, 0.320, 0.380, 0.450, 0.520];
        // Desktop: Existing timings
        const bpsDesktop = [0.100, 0.152, 0.255, 0.325, 0.422, 0.492, 0.550, 0.620];
        return bpsMobile.map((m, i) => THREE.MathUtils.lerp(m, bpsDesktop[i], responsiveT));
    }, [responsiveT]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Load GLTF Models
    const { scene: chairScene } = useGLTF('/landing_chair.glb');
    const { scene: lampScene } = useGLTF('/landing_lamp.glb');
    const { scene: decorScene } = useGLTF('/landing_decor.glb');

    const buildTransform = (scene: THREE.Group, targetCount: number, scaleFactor: number, xOffset: number, yOffset: number, jitterStrength: number = 0) => {
        // Optimize AABB calculation
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? scaleFactor / maxDim : 1;

        // Collect attributes to avoid massive Vector allocations
        const geometries: { attr: THREE.BufferAttribute, matrix: THREE.Matrix4, count: number }[] = [];
        let totalVertices = 0;
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const geometry = (child as THREE.Mesh).geometry;
                const posAttr = geometry.attributes.position;
                if (posAttr) {
                    child.updateMatrixWorld(true);
                    geometries.push({ attr: posAttr as THREE.BufferAttribute, matrix: child.matrixWorld, count: posAttr.count });
                    totalVertices += posAttr.count;
                }
            }
        });

        const sampled: THREE.Vector3[] = new Array(targetCount);
        for (let i = 0; i < targetCount; i++) {
            if (geometries.length > 0) {
                // Weighted geometry selection for even distribution
                let rand = Math.random() * totalVertices;
                let targetGeom = geometries[0];
                for (const g of geometries) {
                    rand -= g.count;
                    if (rand <= 0) {
                        targetGeom = g;
                        break;
                    }
                }

                // Sample vertex without creating intermediary objects
                const vertexIndex = Math.floor(Math.random() * targetGeom.count);
                const p = new THREE.Vector3().fromBufferAttribute(targetGeom.attr, vertexIndex);
                p.applyMatrix4(targetGeom.matrix);

                p.sub(center).multiplyScalar(scale);

                if (jitterStrength > 0) {
                    const jitter = scale * jitterStrength;
                    p.x += (Math.random() - 0.5) * jitter;
                    p.y += (Math.random() - 0.5) * jitter;
                    p.z += (Math.random() - 0.5) * jitter;
                }

                p.x += xOffset;
                p.y += yOffset;
                sampled[i] = p;
            } else {
                sampled[i] = new THREE.Vector3(xOffset, yOffset, 0);
            }
        }
        return sampled;
    };

    const targetPositions1 = useMemo(() => buildTransform(chairScene, count, THREE.MathUtils.lerp(50, 85, responsiveT), THREE.MathUtils.lerp(0, 45, responsiveT), -5, 0), [chairScene, count, responsiveT]);
    const targetPositions2 = useMemo(() => buildTransform(lampScene, count, THREE.MathUtils.lerp(60, 95, responsiveT), THREE.MathUtils.lerp(0, 45, responsiveT), -5, 0.05), [lampScene, count, responsiveT]);
    const targetPositions3 = useMemo(() => buildTransform(decorScene, count, THREE.MathUtils.lerp(85, 160, responsiveT), THREE.MathUtils.lerp(0, 115, responsiveT), -5, 0), [decorScene, count, responsiveT]);

    // Generate random initial positions
    const particles = useMemo(() => {
        const temp = [];
        const sphereRadius = 30;
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;

            // Precompute sphere target positions to save math per frame
            const sphereX = Math.sin(i) * sphereRadius;
            const sphereY = Math.cos(i) * sphereRadius;
            const sphereZ = Math.tan(i) * sphereRadius;

            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, sphereX, sphereY, sphereZ });
        }
        return temp;
    }, [count]);

    useFrame(() => {
        const currentMesh = mesh.current;
        if (!currentMesh) return;

        // Rotate entire system based on scroll
        currentMesh.rotation.y = scrollProgress * Math.PI * 0.5;
        currentMesh.rotation.z = scrollProgress * 0.2;

        const [b1, b2, b3, b4, b5, b6, b7, b8] = bps;
        const currentScroll = scrollProgress || 0;

        particles.forEach((particle, i) => {
            const { factor, speed, xFactor, yFactor, zFactor, sphereX, sphereY, sphereZ } = particle;
            particle.t += speed / 2; // Update time
            const t = particle.t;

            const s = Math.cos(t);
            const tf = (t / 10) * factor;

            const x = xFactor + Math.cos(tf) + (Math.sin(t) * factor) / 10;
            const y = yFactor + Math.sin(tf) + (Math.cos(t * 2) * factor) / 10;
            const z = zFactor + Math.cos(tf) + (Math.sin(t * 3) * factor) / 10;

            let finalX = x;
            let finalY = y;
            let finalZ = z;

            const pos1 = targetPositions1[i];
            const pos2 = targetPositions2[i];
            const pos3 = targetPositions3[i];

            if (currentScroll < b1) {
                finalX = x; finalY = y; finalZ = z;
            } else if (currentScroll < b2) {
                const progress = (currentScroll - b1) / (b2 - b1);
                finalX = THREE.MathUtils.lerp(x, pos1.x, progress);
                finalY = THREE.MathUtils.lerp(y, pos1.y, progress);
                finalZ = THREE.MathUtils.lerp(z, pos1.z, progress);
            } else if (currentScroll < b3) {
                finalX = pos1.x; finalY = pos1.y; finalZ = pos1.z;
            } else if (currentScroll < b4) {
                const progress = (currentScroll - b3) / (b4 - b3);
                finalX = THREE.MathUtils.lerp(pos1.x, pos2.x, progress);
                finalY = THREE.MathUtils.lerp(pos1.y, pos2.y, progress);
                finalZ = THREE.MathUtils.lerp(pos1.z, pos2.z, progress);
            } else if (currentScroll < b5) {
                finalX = pos2.x; finalY = pos2.y; finalZ = pos2.z;
            } else if (currentScroll < b6) {
                const progress = (currentScroll - b5) / (b6 - b5);
                finalX = THREE.MathUtils.lerp(pos2.x, pos3.x, progress);
                finalY = THREE.MathUtils.lerp(pos2.y, pos3.y, progress);
                finalZ = THREE.MathUtils.lerp(pos2.z, pos3.z, progress);
            } else if (currentScroll < b7) {
                finalX = pos3.x; finalY = pos3.y; finalZ = pos3.z;
            } else if (currentScroll < b8) {
                const progress = (currentScroll - b7) / (b8 - b7);
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
                <dodecahedronGeometry args={[0.45, 0]} />
                <meshStandardMaterial
                    color="#C9912B"
                    emissive="#C9912B"
                    emissiveIntensity={0.6}
                    roughness={0.4}
                    metalness={1}
                />
            </instancedMesh>
        </>
    );
}

export default function ParticleCanvas() {
    return (
        <div className="fixed inset-0 z-[4] pointer-events-none">
            <Canvas camera={{ position: [0, 0, 100], fov: 75 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <React.Suspense fallback={null}>
                    <Particles />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
