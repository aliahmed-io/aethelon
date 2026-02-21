"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useGLTF } from "@react-three/drei";
import { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { Camera } from "lucide-react";
import Image from "next/image";

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
// Internal component to handle AR logic and feedback
function ArScene({
    modelUrl,
    onPlaced
}: {
    modelUrl: string;
    onPlaced: () => void
}) {
    const [models, setModels] = useState<THREE.Matrix4[]>([]);
    const [reticleVisible, setReticleVisible] = useState(false);

    // Refs for performance
    const reticleRef = useRef<THREE.Mesh>(null);
    const hitTestSourceRef = useRef<XRHitTestSource | null>(null);

    const { gl } = useThree();
    const { scene: gltfScene } = useGLTF(modelUrl);

    // Reset models when URL changes
    useEffect(() => {
        setModels([]);
    }, [modelUrl]);

    useFrame((state, delta, frame: any) => {
        if (!frame) return;
        const session = frame.session;
        if (!session) return;

        if (!hitTestSourceRef.current) {
            session.requestReferenceSpace("viewer").then((refSpace: any) => {
                session.requestHitTestSource({ space: refSpace }).then((source: any) => {
                    hitTestSourceRef.current = source;
                });
            });
        }

        const hitTestSource = hitTestSourceRef.current;
        if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                // @ts-ignore
                const pose = hit.getPose(gl.xr.getReferenceSpace());
                if (pose && reticleRef.current) {
                    setReticleVisible(true);
                    reticleRef.current.visible = true;
                    reticleRef.current.matrix.fromArray(pose.transform.matrix);
                }
            } else {
                setReticleVisible(false);
            }
        }
    });

    const handleSelect = useCallback(() => {
        if (reticleVisible && reticleRef.current) {
            // Haptic Feedback
            if (navigator.vibrate) navigator.vibrate(20);

            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            reticleRef.current.matrix.decompose(position, quaternion, scale);

            const matrix = new THREE.Matrix4();
            matrix.compose(position, quaternion, new THREE.Vector3(1, 1, 1));

            setModels((prev) => [...prev, matrix]);
            onPlaced(); // Notify parent
        }
    }, [reticleVisible, onPlaced]);

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

            <mesh ref={reticleRef} matrixAutoUpdate={false} visible={reticleVisible}>
                <ringGeometry args={[0.15, 0.2, 32]} />
                <meshBasicMaterial color="white" opacity={0.8} transparent />
            </mesh>

            {models.map((matrix, i) => (
                <primitive key={i} object={gltfScene.clone(true)} applyMatrix4={matrix} />
            ))}
        </>
    );
}

export function ArSession({ modelUrl, related3DProducts = [], onClose }: ArSessionProps) {
    const [activeModelUrl, setActiveModelUrl] = useState(modelUrl);
    const [hasPlaced, setHasPlaced] = useState(false);

    const handleSnapshot = () => {
        const canvas = document.querySelector("canvas");
        if (canvas) {
            const link = document.createElement("a");
            link.download = `ar-snapshot-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            // Feedback
            if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Coaching Overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
                <div className="text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-top-4">
                    {hasPlaced ? "Tap to place another" : "Move phone to detect floor"}
                </div>
            </div>

            {/* Snapshot Button */}
            <button
                onClick={handleSnapshot}
                className="absolute top-6 left-6 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white"
                aria-label="Take Snapshot"
            >
                <Camera className="w-5 h-5" />
            </button>

            <Canvas gl={{ preserveDrawingBuffer: true }}>
                {/* @ts-ignore */}
                <XR store={arStore}>
                    <ArScene
                        modelUrl={activeModelUrl}
                        onPlaced={() => setHasPlaced(true)}
                    />
                </XR>
            </Canvas>

            {/* ... (Related Products Switcher remains same) ... */}
            {related3DProducts.length > 0 && (
                <div className="absolute bottom-8 left-0 right-0 z-20 px-4">
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
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
                                <Image src={prod.image} alt={prod.name} fill unoptimized className="object-cover" />
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
