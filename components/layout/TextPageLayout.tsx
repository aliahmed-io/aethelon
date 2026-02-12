"use client";

// import { motion } from "framer-motion"; // Removed for performance
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
                <div className="mb-16 border-b border-border pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-foreground mb-6 uppercase">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="prose prose-lg max-w-none prose-headings:font-light prose-headings:uppercase prose-headings:tracking-wide prose-p:text-muted-foreground prose-p:leading-loose prose-a:text-foreground prose-a:underline hover:prose-a:text-accent animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-forwards opacity-0" style={{ animationFillMode: 'forwards' }}>
                    {children}
                </div>
            </div>
        </main>
    );
}
