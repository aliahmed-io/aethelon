"use client";

import { motion } from "framer-motion";
import { Navbar } from "./Navbar";
import { ReactNode } from "react";

interface TextPageLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export function TextPageLayout({ title, subtitle, children }: TextPageLayoutProps) {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <div className="pt-32 pb-20 container mx-auto px-6 lg:px-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16 border-b border-white/10 pb-12"
                >
                    <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-white mb-6 uppercase">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xl text-white/50 font-light leading-relaxed max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="prose prose-invert prose-lg max-w-none prose-headings:font-light prose-headings:uppercase prose-headings:tracking-wide prose-p:text-white/70 prose-p:leading-loose prose-a:text-white prose-a:underline hover:prose-a:text-white/80"
                >
                    {children}
                </motion.div>
            </div>
        </main>
    );
}
