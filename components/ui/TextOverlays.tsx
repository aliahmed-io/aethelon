"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

// Helper to create transforms for a section
const useSectionTransforms = (progress: MotionValue<number>, start: number, end: number) => {
    const fadeInStart = start;
    const fadeInEnd = start + 0.05;
    const fadeOutStart = end - 0.05;
    const fadeOutEnd = end;

    const opacity = useTransform(
        progress,
        [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
        [0, 1, 1, 0]
    );

    const y = useTransform(
        progress,
        [start, end],
        [100, -100] // Parallax up
    );

    // Blur out
    const filter = useTransform(
        progress,
        [fadeOutStart, fadeOutEnd],
        ["blur(0px)", "blur(8px)"]
    );

    return { opacity, y, filter };
};

// We need to pass the MotionValue, not the number, to useTransform.
// But we receive a number. 
// Actually, in ScrollController we have `smoothProgress` which IS a MotionValue.
// But we pass `scrollProgress` (number state) to ImageSequence.
// We should pass the MotionValue to TextOverlays for smoother animation.

// Let's update `TextOverlays` to accept `progress` as `MotionValue<number>` 
// OR create a local MotionValue. 
// Creating local from number is laggy.
// PROPOSAL: Update `ScrollController` to pass `smoothProgress` (the MotionValue) to `TextOverlays`.
// `ImageSequence` can keep using number for the RAF loop.

export default function TextOverlays({ progress }: { progress: MotionValue<number> }) {
    // Expecting progress to be a MotionValue<number> passed from parent.
    // If it's a number, useTransform won't work dynamically as expected without re-render.
    // Assume we update ScrollController to pass the MotionValue.

    const p = progress;

    // 1. HERO (0 - 0.15)
    // Starts visible, fades out.
    const heroOpacity = useTransform(p, [0, 0.10], [1, 0]);
    const heroY = useTransform(p, [0, 0.15], [0, -100]);
    const heroBlur = useTransform(p, [0, 0.10], ["blur(0px)", "blur(10px)"]);

    // 2. ENGINEERING (0.15 - 0.40)
    const eng = useSectionTransforms(p, 0.15, 0.40);

    // 3. MOVEMENT (0.40 - 0.65)
    const mov = useSectionTransforms(p, 0.40, 0.65);

    // 4. CASE (0.65 - 0.85)
    const cas = useSectionTransforms(p, 0.65, 0.85);

    // 5. REASSEMBLY (0.85 - 1.0)
    const finOpacity = useTransform(p, [0.85, 0.95], [0, 1]);
    const finY = useTransform(p, [0.85, 1.0], [50, 0]);

    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-center items-center">

            {/* 1. HERO - Centered */}
            <motion.div
                style={{ opacity: heroOpacity, y: heroY, filter: heroBlur }}
                className="absolute text-center max-w-4xl px-6"
            >
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-6">
                    PILOT&apos;S WATCH <br /> CHRONOGRAPH 41
                </h1>
                <p className="text-xl md:text-2xl text-white/60 tracking-tight font-light">
                    &quot;AETHELON&quot; CERATANIUM®
                </p>
            </motion.div>

            {/* 2. ENGINEERING - Left Aligned */}
            <motion.div
                style={eng}
                className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 max-w-md"
            >
                <h2 className="text-4xl text-white font-bold tracking-tight mb-4">ENGINEERED, NOT DECORATED.</h2>
                <p className="text-lg text-white/70 leading-relaxed">
                    Every component serves precision, durability, and legibility.
                    The sapphire crystal is secured against displacement by drop in air pressure.
                </p>
            </motion.div>

            {/* 3. MOVEMENT - Right Aligned */}
            <motion.div
                style={mov}
                className="absolute right-10 md:right-20 top-1/2 -translate-y-1/2 max-w-md text-right"
            >
                <h2 className="text-4xl text-white font-bold tracking-tight mb-4">MECHANICAL PRECISION.</h2>
                <p className="text-lg text-white/70 leading-relaxed">
                    Aethelon-sintered V-900 calibre.
                    A robust chronograph movement with a column-wheel design
                    and 46 hours of power reserve.
                </p>
            </motion.div>

            {/* 4. CASE - Left Aligned */}
            <motion.div
                style={cas}
                className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 max-w-md"
            >
                <h2 className="text-4xl text-white font-bold tracking-tight mb-4">CERATANIUM®.</h2>
                <p className="text-lg text-white/70 leading-relaxed">
                    Light as titanium, hard as ceramic.
                    Developed by Aethelon Labs, this material is scratch-resistant
                    and skin-friendly, with a matte black stealth finish.
                </p>
            </motion.div>

            {/* 5. FINISH - Centered */}
            <motion.div
                style={{ opacity: finOpacity, y: finY }}
                className="absolute text-center max-w-4xl px-6"
            >
                <h2 className="text-5xl font-bold tracking-tighter text-white mb-8">
                    FORM FOLLOWS FUNCTION.
                </h2>
                <button className="pointer-events-auto px-8 py-4 bg-white text-black font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors">
                    Configure Yours
                </button>
            </motion.div>

        </div>
    );
}
