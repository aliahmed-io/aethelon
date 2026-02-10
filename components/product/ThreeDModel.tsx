"use client";

import { useEffect, useMemo, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import { Box3, Vector3 } from "three";

interface ThreeDModelProps {
    modelUrl: string;
    onBounds: (center: Vector3, radius: number) => void;
    orbitTarget: Vector3 | null;
    orbitRadius: number | null;
}

function Model({ url, onBounds }: { url: string; onBounds: (center: Vector3, radius: number) => void }) {
    const { scene } = useGLTF(url);

    useEffect(() => {
        const box = new Box3().setFromObject(scene);
        const center = new Vector3();
        const size = new Vector3();

        box.getCenter(center);
        box.getSize(size);

        // Recenter model to (0,0,0) so orbit always rotates around the shoe's true center.
        scene.position.sub(center);

        const radius = Math.max(size.x, size.y, size.z) / 2;
        onBounds(new Vector3(0, 0, 0), radius);
    }, [scene, onBounds]);

    return <primitive object={scene} />;
}

function CenteredOrbitControls({
    target,
    radius,
}: {
    target: Vector3 | null;
    radius: number | null;
}) {
    const { camera } = useThree();
    const targetArr = useMemo(() => {
        if (!target) return null;
        return [target.x, target.y, target.z] as [number, number, number];
    }, [target]);

    useEffect(() => {
        if (!target || !radius) return;

        camera.position.set(target.x, target.y, target.z + radius * 3);
        camera.near = Math.max(0.1, radius / 100);
        camera.far = Math.max(1000, radius * 100);
        camera.updateProjectionMatrix();
        camera.lookAt(target);
    }, [camera, radius, target]);

    return (
        <OrbitControls
            makeDefault
            autoRotate
            autoRotateSpeed={0.5}
            enablePan={false}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 1.9}
            target={targetArr ?? undefined}
        />
    );
}

export default function ThreeDModel({ modelUrl, onBounds, orbitTarget, orbitRadius }: ThreeDModelProps) {
    return (
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 150], fov: 50 }}>
            <Suspense fallback={null}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 8, 5]} intensity={1.2} />
                <Model url={modelUrl} onBounds={onBounds} />
                <CenteredOrbitControls
                    target={orbitTarget}
                    radius={orbitRadius}
                />
                <Environment preset="city" />
            </Suspense>
        </Canvas>
    );
}
