"use client";

import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-[#050505] z-[9999] flex items-center justify-center overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-[500px] h-[500px] bg-white rounded-full blur-[100px]"
                />
            </div>

            {/* Central Core */}
            <div className="relative">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border border-white/10 rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 m-4 border border-white/20 rounded-full" // inner ring
                />
                <motion.div
                    animate={{ scale: [1, 0.8, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]" // core dot
                />
            </div>

            {/* Text */}
            <motion.p
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-12 text-[10px] uppercase tracking-[0.5em] text-white/50 font-mono"
            >
                Aethelon System
            </motion.p>
        </div>
    );
}
