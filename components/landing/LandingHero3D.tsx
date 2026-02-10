"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ShoeModel } from "./ShoeModel";

export default function LandingHero3D() {
    return (
        <Canvas
            className="w-full h-full"
            camera={{ position: [0, 0, 5], fov: 45 }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Environment preset="city" />
            <Suspense fallback={
                <Html center>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </Html>
            }>
                <ShoeModel />
            </Suspense>
            <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
        </Canvas>
    );
}
