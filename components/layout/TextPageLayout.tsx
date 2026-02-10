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
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="pt-32 pb-20 container mx-auto px-6 lg:px-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16 border-b border-border pb-12"
                >
                    <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-foreground mb-6 uppercase">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="prose prose-lg max-w-none prose-headings:font-light prose-headings:uppercase prose-headings:tracking-wide prose-p:text-muted-foreground prose-p:leading-loose prose-a:text-foreground prose-a:underline hover:prose-a:text-accent"
                >
                    {children}
                </motion.div>
            </div>
        </main>
    );
}
