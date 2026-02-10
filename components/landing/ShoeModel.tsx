"use client";

import React, { useRef } from "react";
import { useGLTF, Center } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import * as THREE from "three";

export function ShoeModel() {
    const { scene } = useGLTF("/shoes_outdoor-v2.glb");
    const modelRef = useRef<THREE.Group>(null);

    useGSAP(() => {
        if (modelRef.current) {
            gsap.to(modelRef.current.rotation, {
                y: Math.PI * 2,
                duration: 8,
                repeat: -1,
                ease: "none",
            });
        }
    });

    // Disposal removed: useGLTF manages cache internally. Manual disposal causes issues with re-renders.

    React.useEffect(() => {
        const currentModel = modelRef.current;

        // Fix: Apply visible materials to the model so it's not black
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                // varied colors for visual interest if possible, but safe default is Primary
                mesh.material = new THREE.MeshStandardMaterial({
                    color: "#cccccc", // Neutral Gray (Placeholder/Prototype look)
                    roughness: 0.5,
                    metalness: 0.1,
                    envMapIntensity: 1.5
                });
            }
        });

        return () => {
            if (currentModel) {
                currentModel.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach((m) => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        };
    }, [scene]);

    return (
        <Center>
            <group ref={modelRef} dispose={null}>
                <primitive object={scene} scale={13.5} />
            </group>
        </Center>
    );
}

useGLTF.preload("/shoes_outdoor-v2.glb");
