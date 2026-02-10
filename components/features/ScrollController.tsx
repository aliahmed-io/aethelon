"use client";

import { useScroll, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import ImageSequence from "./ImageSequence";
import TextOverlays from "./TextOverlays";


export default function ScrollController() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Smooth the scroll progress slightly to prevent micro-jitters
    // "mass" and "stiffness" can be tuned for "weighty" feel
    const smoothProgress = useSpring(scrollYProgress, {
        mass: 0.1,
        stiffness: 100,
        damping: 20,
        restDelta: 0.001
    });

    useEffect(() => {
        return smoothProgress.on("change", (latest) => {
            setScrollProgress(latest);
        });
    }, [smoothProgress]);

    // Height: 240 frames. Let's say 15px per frame = 3600px + 1 viewport height (spacer).
    // Total ~ 500vh to feel substantial.

    return (
        <div className="relative bg-background">
            {/* Navbar (fixed) */}
            <Navbar progress={scrollProgress} />

            {/* Scrollable Container */}
            <div ref={containerRef} className="h-[500vh] relative">

                {/* Sticky Viewport */}
                <div className="sticky top-0 h-screen w-full overflow-hidden">
                    {/* Background Sequence */}
                    <ImageSequence progress={scrollProgress} />

                    {/* Text Overlays (also sticky, but animate internally based on progress) */}
                    <TextOverlays progress={smoothProgress} />
                </div>
            </div>


        </div>
    );
}
