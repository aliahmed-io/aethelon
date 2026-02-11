'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, RotateCw, Sun, Moon, Sparkles, X, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export default function AIVisionPage() {
    const [mode, setMode] = useState<'upload' | 'visualize'>('upload');

    return (
        <div className="min-h-screen bg-background text-foreground relative">
            <Navbar />

            {mode === 'upload' ? (
                <div className="min-h-screen flex items-center justify-center relative pt-24 pb-20">
                    {/* Background image with light overlay */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600210492486-bccad642388e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />

                    <div className="z-10 text-center max-w-xl px-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-background/80 backdrop-blur-xl border border-border p-12 rounded-sm"
                        >
                            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1 rounded-full mb-6">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">AI Vision</span>
                            </div>
                            <h1 className="font-display text-4xl mb-4 tracking-tighter uppercase">Visualize in Your Space</h1>
                            <p className="text-muted-foreground mb-8">
                                Upload a photo of your room or use our sample environments to see Aethelon furniture in context.
                            </p>

                            <div className="grid gap-4">
                                <button
                                    onClick={() => setMode('visualize')}
                                    className="bg-accent text-accent-foreground w-full py-4 rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-5 h-5" /> Upload Photo
                                </button>
                                <button
                                    onClick={() => setMode('visualize')}
                                    className="bg-muted text-foreground w-full py-4 rounded-sm font-medium text-sm hover:bg-muted/80 transition-colors border border-border"
                                >
                                    Use Sample Living Room
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <div className="h-screen relative pt-20">
                    {/* Exit button */}
                    <div className="absolute top-24 right-6 z-30">
                        <button
                            onClick={() => setMode('upload')}
                            className="bg-background/90 backdrop-blur border border-border px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center gap-2 hover:bg-muted"
                        >
                            <ArrowLeft className="w-4 h-4" /> Exit Visualizer
                        </button>
                    </div>

                    {/* Main Canvas Area */}
                    <div className="absolute inset-0 top-20 bg-muted">
                        <Image
                            src="https://images.unsplash.com/photo-1600210492486-bccad642388e?q=80&w=2574&auto=format&fit=crop"
                            alt="Room"
                            fill
                            className="object-cover opacity-80"
                            priority
                        />

                        {/* 3D Object Overlay Mockup */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[300px] border-2 border-accent/50 rounded-sm flex items-center justify-center bg-accent/5 backdrop-blur-[2px]">
                            <div className="text-accent font-display text-2xl drop-shadow-md">Copenhagen Sectional (3D Model)</div>

                            {/* Control Handles */}
                            <div className="absolute -top-3 -left-3 w-6 h-6 bg-background rounded-full border-4 border-accent shadow-lg cursor-nw-resize" />
                            <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-background rounded-full border-4 border-accent shadow-lg cursor-se-resize" />

                            <div className="absolute top-full mt-4 flex gap-2 bg-background/90 backdrop-blur px-4 py-2 rounded-sm border border-border">
                                <button className="p-2 hover:text-accent transition-colors text-muted-foreground"><RotateCw className="w-5 h-5" /></button>
                                <div className="w-px h-6 bg-border" />
                                <button className="p-2 hover:text-accent transition-colors text-muted-foreground"><Sun className="w-5 h-5" /></button>
                                <button className="p-2 hover:text-accent transition-colors text-muted-foreground"><Moon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Toolbar */}
                    <div className="absolute left-6 top-28 bottom-24 w-80 bg-background/90 backdrop-blur-xl border border-border rounded-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-border">
                            <h3 className="font-display text-lg">Products</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {['Sofa', 'Armchair', 'Coffee Table', 'Lamp'].map((item) => (
                                <div key={item} className="bg-muted hover:bg-muted/80 p-3 rounded-sm cursor-grab active:cursor-grabbing border border-transparent hover:border-accent/20 transition-all flex gap-3 items-center">
                                    <div className="w-16 h-12 bg-secondary rounded-sm" />
                                    <div>
                                        <div className="font-medium text-sm">{item}</div>
                                        <div className="text-xs text-muted-foreground">$1,200</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Properties Panel */}
                    <div className="absolute right-6 top-28 bottom-24 w-80 bg-background/90 backdrop-blur-xl border border-border rounded-sm flex flex-col">
                        <div className="p-6">
                            <h2 className="font-display text-2xl mb-1">Copenhagen</h2>
                            <p className="text-muted-foreground text-sm mb-6">Velvet Sectional Sofa</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">Material</label>
                                    <div className="flex gap-2">
                                        <button className="w-8 h-8 rounded-full bg-[#1A5276] border-2 border-foreground ring-2 ring-accent ring-offset-2 ring-offset-background" title="Velvet Blue" />
                                        <button className="w-8 h-8 rounded-full bg-[#5D6D7E] border border-border hover:scale-110 transition-transform" />
                                        <button className="w-8 h-8 rounded-full bg-[#A04000] border border-border hover:scale-110 transition-transform" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">Dimensions</label>
                                    <div className="flex bg-muted rounded-sm p-1">
                                        <button className="flex-1 py-1.5 text-xs font-medium bg-background rounded-sm shadow-sm">3-Seater</button>
                                        <button className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">L-Shape</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-6 border-t border-border bg-muted/50">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-muted-foreground text-sm">Total</span>
                                <span className="font-display text-2xl text-accent">$4,850</span>
                            </div>
                            <button className="w-full bg-accent text-accent-foreground font-bold py-3 rounded-sm hover:bg-accent/90 transition-colors uppercase tracking-widest text-sm">
                                Add to Room
                            </button>
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-xl border border-border rounded-sm px-6 py-3 flex gap-6 items-center">
                        <button className="text-sm font-medium hover:text-accent transition-colors text-muted-foreground">Undo</button>
                        <div className="w-px h-4 bg-border" />
                        <button className="text-sm font-medium hover:text-accent transition-colors text-muted-foreground">Redo</button>
                        <div className="w-px h-4 bg-border" />
                        <button className="flex items-center gap-2 text-accent font-medium text-sm">
                            <Sparkles className="w-4 h-4" /> AI Suggest
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
