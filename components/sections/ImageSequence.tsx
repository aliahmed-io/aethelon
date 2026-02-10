
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ImageSequenceProps {
    progress: number; // 0 to 1
}

const TOTAL_FRAMES = 231;
const FRAME_PATH = "/assets/image sequence/ezgif-frame";

export default function ImageSequence({ progress }: ImageSequenceProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loadedCount, setLoadedCount] = useState(0);

    // Ref for the current "visual" frame to allow lerping
    const currentFrameRef = useRef(0);
    const requestRef = useRef<number>(0);

    // UseRef for progress to access inside the loop without re-binding
    const progressRef = useRef(progress);
    useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    // Preload Images
    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];
        let loadCounter = 0;

        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new window.Image(); // Use window.Image to avoid conflict with next/image
            const frameStr = i.toString().padStart(3, "0");
            img.src = `${FRAME_PATH}${frameStr}.jpg`;
            img.onload = () => {
                loadCounter++;
                setLoadedCount(loadCounter);
            };
            loadedImages.push(img);
        }
        setImages(loadedImages);
    }, []);

    // Main Render Loop
    // Wrapped in useCallback to satisfy dependency if needed, but easier to just use refs or move logic inside effect
    const renderLoop = useRef<() => void>(undefined);

    useEffect(() => {
        renderLoop.current = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const targetFrame = Math.min(
                Math.max(progressRef.current * (TOTAL_FRAMES - 1), 0),
                TOTAL_FRAMES - 1
            );

            const diff = targetFrame - currentFrameRef.current;
            // Snap if close
            if (Math.abs(diff) < 0.05) {
                currentFrameRef.current = targetFrame;
            } else {
                currentFrameRef.current += diff * 0.15;
            }

            const frameIndex = Math.round(currentFrameRef.current);
            if (images.length > 0) {
                const img = images[frameIndex];
                if (img && img.complete) {
                    const cw = canvas.width;
                    const ch = canvas.height;

                    ctx.fillStyle = "#050505";
                    ctx.fillRect(0, 0, cw, ch);

                    const iw = img.naturalWidth;
                    const ih = img.naturalHeight;
                    const scale = Math.min(cw / iw, ch / ih) * 1.3; // Zoom 1.3x to hide veo watermark
                    const drawW = iw * scale;
                    const drawH = ih * scale;
                    const offsetX = (cw - drawW) / 2;
                    const offsetY = (ch - drawH) / 2;

                    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
                }
            }
            requestRef.current = requestAnimationFrame(renderLoop.current!);
        };
    }, [images]); // Re-create loop function when images change

    useEffect(() => {
        if (renderLoop.current) {
            requestRef.current = requestAnimationFrame(renderLoop.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [images]); // Depend on images so loop starts after load starts

    // Resize Handling
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // Init
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#050505]">
            {/* Static Image Placeholder / Preloader */}
            <div
                className={`absolute inset-0 z-10 transition-opacity duration-1000 ${loadedCount === TOTAL_FRAMES ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                {/* High-res First Frame Placeholder */}
                <Image
                    src={`${FRAME_PATH}001.jpg`}
                    alt="Loading..."
                    fill
                    priority
                    className="object-cover"
                />

                {/* Loading Text */}
                <div className="absolute bottom-10 right-10 text-white/50 text-xs font-mono tracking-widest">
                    SYSTEM INITIALIZATION... {Math.round((loadedCount / TOTAL_FRAMES) * 100)}%
                </div>
            </div>

            <canvas ref={canvasRef} className="block" />
        </div>
    );
}
