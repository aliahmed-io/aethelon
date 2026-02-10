"use client";

import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-background z-[9999] flex items-center justify-center overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.15, 0.05],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-[500px] h-[500px] bg-accent rounded-full blur-[100px]"
                />
            </div>

            {/* Central Core */}
            <div className="relative">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border border-border rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 m-4 border border-accent/30 rounded-full"
                />
                <motion.div
                    animate={{ scale: [1, 0.8, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 m-auto w-2 h-2 bg-accent rounded-full shadow-[0_0_20px_rgba(201,145,43,0.6)]"
                />
            </div>

            {/* Text */}
            <motion.p
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-12 text-[10px] uppercase tracking-[0.5em] text-muted-foreground font-mono"
            >
                Aethelon System
            </motion.p>
        </div>
    );
}
