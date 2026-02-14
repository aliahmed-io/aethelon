"use client";

import { useXR } from "@react-three/xr";
import { RotateCw, X } from "lucide-react";

interface ArControlsProps {
    onReset: () => void;
}

export function ArControls({ onReset }: ArControlsProps) {
    const { session } = useXR();

    if (!session) return null;

    return (
        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center justify-center pointer-events-none z-50">
            <div className="bg-black/40 backdrop-blur-md text-white px-6 py-3 rounded-full mb-4 text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
                Tap on floor to place model
            </div>

            <button
                onClick={onReset}
                className="pointer-events-auto bg-white text-black p-4 rounded-full shadow-lg active:scale-95 transition-transform"
                aria-label="Reset Model"
            >
                <RotateCw className="w-6 h-6" />
            </button>
        </div>
    );
}
