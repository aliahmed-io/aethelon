"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useCapabilities } from "@/components/ar/useCapabilities";
import "@google/model-viewer";
import { useGLTF } from "@react-three/drei";
import { Matrix4 } from "three";
import { Interactive, useXRHitTest } from "@react-three/xr";

const xrStore = typeof window !== "undefined"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require("@react-three/xr") as typeof import("@react-three/xr")).createXRStore({
        // @ts-ignore
        sessionInit: {
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["dom-overlay", "light-estimation"],
            // @ts-ignore
            domOverlay: typeof document !== "undefined" ? { root: document.body } : undefined,
        },
    })
    : null;

const ARButton = dynamic(
    () => import("@react-three/xr").then((m) => m.ARButton),
    { ssr: false }
);

// ---------------------------------------------------------------------------
// arStore stub — kept for backwards-compat with any remaining import sites.
// The WebXR createXRStore approach has been replaced with model-viewer AR.
// ---------------------------------------------------------------------------
export const arStore = {
    /** No-op: AR is now triggered via model-viewer ref in ArSession. */
    enterAR: () => undefined,
};

interface ArSessionProps {
    modelUrl: string;
    usdzUrl?: string | null;
    related3DProducts?: {
        id: string;
        name: string;
        modelUrl: string;
        image: string;
    }[];
    onClose?: () => void;
}

type ModelViewerEl = HTMLElement & {
    activateAR(): void;
    canActivateAR: boolean;
};

/**
 * ArSession — model-viewer-based AR session overlay.
 *
 * Replaces the previous @react-three/xr WebXR implementation which was
 * incompatible with React 19 + @react-three/fiber v9. This approach:
 *  - Uses Google Scene Viewer on Android (via `ar-modes="scene-viewer"`)
 *  - Uses Quick Look on iOS (via `ios-src` / `ar-modes="quick-look"`)
 *  - Requires no WebXR browser flag
 *  - Works on ~95 % of mobile AR-capable devices
 */
export function ArSession({
    modelUrl,
    usdzUrl,
    related3DProducts = [],
    onClose,
}: ArSessionProps) {
    const [activeModelUrl, setActiveModelUrl] = useState(modelUrl);
    const [activeUsdzUrl, setActiveUsdzUrl] = useState(usdzUrl ?? null);
    const { isWebXrSupported, isSecureContext } = useCapabilities();

    const isWebXrReady = isWebXrSupported && isSecureContext;

    const models = useMemo(() => {
        const main = { id: "__main__", name: "Main", modelUrl, usdzUrl: usdzUrl ?? null, image: "" };
        const rest = related3DProducts.map((p) => ({
            id: p.id,
            name: p.name,
            modelUrl: p.modelUrl,
            usdzUrl: null as string | null,
            image: p.image,
        }));
        return [main, ...rest];
    }, [modelUrl, related3DProducts, usdzUrl]);

    if (isWebXrReady) {
        return (
            <div className="fixed inset-0 z-50 bg-black">
                <div className="absolute inset-0">
                    <ArWebXRScene modelUrl={activeModelUrl} />
                </div>

                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
                    <div className="text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border border-white/10 text-center">
                        Tap “Enter AR” and allow camera
                    </div>
                </div>

                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
                    <ARButton
                        // WebXR-first flow (matches reference project)
                        // @ts-ignore - API differences across @react-three/xr versions
                        store={xrStore}
                        // @ts-ignore
                        mode="immersive-ar"
                        className="px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-xl transition-all active:scale-95"
                    >
                        Enter AR
                    </ARButton>
                </div>

                {related3DProducts.length > 0 && (
                    <div className="absolute bottom-8 left-0 right-0 z-20 px-4 pointer-events-none">
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x pointer-events-auto">
                            {models.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        setActiveModelUrl(m.modelUrl);
                                        setActiveUsdzUrl(m.usdzUrl);
                                    }}
                                    className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all snap-start ${activeModelUrl === m.modelUrl
                                        ? "border-amber-500 ring-2 ring-amber-500/50"
                                        : "border-white/20 opacity-80"
                                        }`}
                                >
                                    {m.id === "__main__" ? (
                                        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-[10px] text-white font-bold text-center p-1">
                                            Main
                                        </div>
                                    ) : (
                                        <>
                                            <Image
                                                src={m.image}
                                                alt={m.name}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white truncate px-1 py-0.5">
                                                {m.name}
                                            </div>
                                        </>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
                <div className="text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border border-white/10 text-center">
                    {isSecureContext ? "WebXR not supported on this device" : "AR requires HTTPS"}
                </div>
            </div>

            <model-viewer
                src={activeModelUrl}
                ios-src={activeUsdzUrl ?? undefined}
                alt="3D model in AR"
                ar
                ar-modes="scene-viewer quick-look"
                ar-scale="auto"
                ar-placement="floor"
                camera-controls
                auto-rotate
                shadow-intensity="1"
                shadow-softness="1"
                exposure="1"
                environment-image="neutral"
                loading="eager"
                reveal="auto"
                style={{
                    width: "100%",
                    flex: 1,
                    backgroundColor: "#000",
                    ["--poster-color" as string]: "#000",
                }}
            />

            {related3DProducts.length > 0 && (
                <div className="absolute bottom-8 left-0 right-0 z-20 px-4 pointer-events-none">
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x pointer-events-auto">
                        {models.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => {
                                    setActiveModelUrl(m.modelUrl);
                                    setActiveUsdzUrl(m.usdzUrl);
                                }}
                                className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all snap-start ${activeModelUrl === m.modelUrl
                                    ? "border-amber-500 ring-2 ring-amber-500/50"
                                    : "border-white/20 opacity-80"
                                    }`}
                            >
                                {m.id === "__main__" ? (
                                    <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-[10px] text-white font-bold text-center p-1">
                                        Main
                                    </div>
                                ) : (
                                    <>
                                        <Image
                                            src={m.image}
                                            alt={m.name}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white truncate px-1 py-0.5">
                                            {m.name}
                                        </div>
                                    </>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ArWebXRScene({ modelUrl }: { modelUrl: string }) {
    const Canvas = useMemo(
        () =>
            dynamic(() => import("@react-three/fiber").then((m) => m.Canvas), {
                ssr: false,
            }),
        []
    );
    const XR = useMemo(
        () =>
            dynamic(() => import("@react-three/xr").then((m) => m.XR), {
                ssr: false,
            }),
        []
    );

    return (
        <Canvas
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0, 1.6, 0], fov: 60 }}
            style={{ width: "100%", height: "100%", background: "transparent" }}
        >
            {/* @ts-ignore - XR requires a store prop in this version */}
            <XR store={xrStore ?? undefined}>
                <ambientLight intensity={1.2} />
                <directionalLight position={[3, 5, 2]} intensity={1.2} />
                <ARPlacement modelUrl={modelUrl} />
            </XR>
        </Canvas>
    );
}

function ARPlacement({ modelUrl }: { modelUrl: string }) {
    const reticleRef = useRef<any>(null);

    const [placed, setPlaced] = useState<{ position: [number, number, number]; quaternion: [number, number, number, number] }[]>([]);

    useEffect(() => {
        setPlaced([]);
    }, [modelUrl]);

    const mat = useMemo(() => new Matrix4(), []);
    const tmpPos = useMemo(() => new (require("three").Vector3)(), []);
    const tmpQuat = useMemo(() => new (require("three").Quaternion)(), []);
    const tmpScale = useMemo(() => new (require("three").Vector3)(), []);

    // Update reticle pose from hit test
    // @ts-ignore - hook signature differs across @react-three/xr versions
    useXRHitTest(reticleRef, (hitMatrix: Float32Array) => {
        const r = reticleRef.current;
        if (!r) return;
        mat.fromArray(hitMatrix);
        r.matrixAutoUpdate = false;
        r.matrix.fromArray(hitMatrix);
        r.visible = true;
    });

    const place = () => {
        const r = reticleRef.current;
        if (!r || !r.visible) return;

        // Reticle is driven by a matrix (matrixAutoUpdate=false) so we must decompose
        // to get correct position/quaternion.
        r.matrix.decompose(tmpPos, tmpQuat, tmpScale);

        setPlaced((prev) => [
            ...prev,
            {
                position: [tmpPos.x, tmpPos.y, tmpPos.z],
                quaternion: [tmpQuat.x, tmpQuat.y, tmpQuat.z, tmpQuat.w],
            },
        ]);
    };

    return (
        <>
            <Interactive onSelect={place}>
                <mesh ref={reticleRef} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.08, 0.1, 32]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
                </mesh>
            </Interactive>

            {placed.map((p, idx) => (
                <ARModel
                    key={idx}
                    url={modelUrl}
                    position={p.position}
                    quaternion={p.quaternion}
                />
            ))}
        </>
    );
}

function ARModel({
    url,
    position,
    quaternion,
}: {
    url: string;
    position: [number, number, number];
    quaternion: [number, number, number, number];
}) {
    const gltf = useGLTF(url);
    const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
    return (
        <primitive
            object={scene}
            position={position}
            quaternion={quaternion as any}
            scale={1}
        />
    );
}
