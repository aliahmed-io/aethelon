"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useGLTF } from "@react-three/drei";
import { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

// Store configuration for WebXR session
export const arStore = createXRStore({
    depthSensing: true,
    hitTest: true,
});

// Preload the model to prevent jank on placement
// (useGLTF.preload is already provided by drei)

interface ArSessionProps {
    modelUrl: string;
    related3DProducts?: {
        id: string;
        name: string;
        modelUrl: string;
        image: string;
    }[];
    onClose?: () => void;
}

/**
 * AR Scene Logic Validation:
 * - Uses 'requestHitTestSource' for unstable surface detection (floor/tables).
 * - Matches '3D-WebXR-Furniture' logic: Hit Test -> Reticle Matrix -> Tap -> Clone -> Decompose -> Place.
 */
function ArScene({ modelUrl }: { modelUrl: string }) {
    const [models, setModels] = useState<THREE.Matrix4[]>([]);
    const [reticleVisible, setReticleVisible] = useState(false);

    // Refs for performance (no re-renders on every frame)
    const reticleRef = useRef<THREE.Mesh>(null);
    const hitTestSourceRef = useRef<XRHitTestSource | null>(null);

    const { gl } = useThree();
    const { scene: gltfScene } = useGLTF(modelUrl);

    // Reset models when URL changes
    useEffect(() => {
        setModels([]);
    }, [modelUrl]);

    // Hit Test Loop - Runs every frame
    useFrame((state, delta, frame: any) => {
        if (!frame) return;

        const session = frame.session;
        if (!session) return;

        // 1. Request Hit Test Source (Start of Session)
        if (!hitTestSourceRef.current) {
            session.requestReferenceSpace("viewer").then((refSpace: any) => {
                session.requestHitTestSource({ space: refSpace }).then((source: any) => {
                    hitTestSourceRef.current = source;
                });
            });
        }

        // 2. Process Hit Test Results
        const hitTestSource = hitTestSourceRef.current;
        if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);

            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                // @ts-ignore - refSpace is standard in simple XR setups
                const pose = hit.getPose(gl.xr.getReferenceSpace());

                if (pose && reticleRef.current) {
                    setReticleVisible(true);
                    reticleRef.current.visible = true;
                    // PERF: Manually update matrix to avoid overhead
                    reticleRef.current.matrix.fromArray(pose.transform.matrix);
                }
            } else {
                setReticleVisible(false);
            }
        }
    });

    // Handle Tap to Place (Logic adapted from repo: decompose -> recompose)
    // Wrapped in useCallback to stabilize dependency for useEffect
    const handleSelect = useCallback(() => {
        if (reticleVisible && reticleRef.current) {
            // 1. Decompose Reticle Matrix (Position, Rotation, Scale)
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();

            reticleRef.current.matrix.decompose(position, quaternion, scale);

            // 2. Create Model Matrix
            // We force scale to 1 (or 100% of GLB) to ensure "True Scale" physics
            const matrix = new THREE.Matrix4();
            matrix.compose(position, quaternion, new THREE.Vector3(1, 1, 1));

            setModels((prev) => [...prev, matrix]);
        }
    }, [reticleVisible]);

    // Bind Select Event to Session
    useEffect(() => {
        const session = gl.xr.getSession();
        if (session) {
            session.addEventListener("select", handleSelect);
            return () => session.removeEventListener("select", handleSelect);
        }
    }, [gl.xr, handleSelect]);

    return (
        <>
            <ambientLight intensity={1} />
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow />

            {/* Placement Reticle */}
            {/* matrixAutoUpdate={false} is critical when we manually set matrix from hit test */}
            <mesh ref={reticleRef} matrixAutoUpdate={false} visible={reticleVisible}>
                <ringGeometry args={[0.15, 0.2, 32]} />
                <meshBasicMaterial color="white" opacity={0.8} transparent />
                {/* Visual rotation handled by geometry orientation or initial matrix logic if needed */}
            </mesh>

            {/* Placed Models */}
            {models.map((matrix, i) => (
                // Clone needed to allow independent instances
                <primitive key={i} object={gltfScene.clone(true)} applyMatrix4={matrix} />
            ))}
        </>
    );
}

export function ArSession({ modelUrl, related3DProducts = [], onClose }: ArSessionProps) {
    const [activeModelUrl, setActiveModelUrl] = useState(modelUrl);

    return (
        <div className="fixed inset-0 z-50 bg-black">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium z-10 pointer-events-none">
                Tap floor to place
            </div>

            <Canvas>
                {/* @ts-ignore - XR store integration */}
                <XR store={arStore}>
                    <ArScene modelUrl={activeModelUrl} />
                </XR>
            </Canvas>

            {/* Related Products Switcher (Overlay) */}
            {related3DProducts.length > 0 && (
                <div className="absolute bottom-8 left-0 right-0 z-20 px-4">
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {/* Current Product (Reset Option) */}
                        <button
                            onClick={() => setActiveModelUrl(modelUrl)}
                            className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all snap-start ${activeModelUrl === modelUrl ? "border-amber-500 ring-2 ring-amber-500/50" : "border-white/20 opacity-80"
                                }`}
                        >
                            <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-[10px] text-white font-bold text-center p-1">
                                Main
                            </div>
                        </button>

                        {related3DProducts.map((prod) => (
                            <button
                                key={prod.id}
                                onClick={() => setActiveModelUrl(prod.modelUrl)}
                                className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all snap-start ${activeModelUrl === prod.modelUrl ? "border-amber-500 ring-2 ring-amber-500/50" : "border-white/20 opacity-80"
                                    }`}
                            >
                                {/* We assume prod.image is valid, fallback to bg color */}
                                <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white truncate px-1 py-0.5">
                                    {prod.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
