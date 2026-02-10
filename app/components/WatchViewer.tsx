"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows, Center } from "@react-three/drei";
import { Suspense } from "react";

function Model(props: any) {
    const { scene } = useGLTF("/assets/models/watch.glb");
    // Adjust scale if the crude model is huge/tiny. 
    // Assuming generic units, we start small.
    return <primitive object={scene} {...props} />;
}

export default function WatchViewer() {
    return (
        <div className="w-full h-[500px] md:h-[600px] relative cursor-move">
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, position: [0, 0, 8] }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />

                    <Environment preset="city" />

                    {/* Scale adjusted to 4.0 based on user feedback */}
                    <Center position={[0, -0.5, 0]}>
                        <Model scale={3.0} />
                    </Center>

                    <ContactShadows opacity={0.4} scale={10} blur={2} far={4} />

                    <OrbitControls
                        autoRotate
                        autoRotateSpeed={1.0}
                        enableZoom={true}
                        maxPolarAngle={Math.PI / 1.5}
                        minPolarAngle={Math.PI / 2.5}
                    />
                </Suspense>
            </Canvas>

            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="text-white/20 text-xs font-mono tracking-widest uppercase">
                    Drag to Rotate • 3D Visualization
                </span>
            </div>
        </div>
    );
}

useGLTF.preload("/assets/models/watch.glb");
