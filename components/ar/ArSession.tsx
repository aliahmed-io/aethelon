"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useGLTF } from "@react-three/drei";
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";

// Store configuration for WebXR session
const store = createXRStore({
    depthSensing: true,
    hitTest: true,
});

// Preload the model to prevent jank on placement
useGLTF.preload = (url: string) => useGLTF.preload(url);

interface ArSessionProps {
    modelUrl: string;
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
    const handleSelect = () => {
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
    };

    // Bind Select Event to Session
    useEffect(() => {
        const session = gl.xr.getSession();
        if (session) {
            session.addEventListener("select", handleSelect);
            return () => session.removeEventListener("select", handleSelect);
        }
    }, [gl.xr, reticleVisible]);

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

export function ArSession({ modelUrl }: ArSessionProps) {
    return (
        <div className="fixed inset-0 z-50 bg-black">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium z-10 pointer-events-none">
                Tap floor to place
            </div>

            <Canvas>
                {/* @ts-ignore - XR store integration */}
                <XR store={store}>
                    <ArScene modelUrl={modelUrl} />
                </XR>
            </Canvas>
        </div>
    );
}
