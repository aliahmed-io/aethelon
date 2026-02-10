'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, RotateCw, Sun, Moon, Sparkles, X } from 'lucide-react';
import Image from 'next/image';

export default function AIVisionPage() {
    const [mode, setMode] = useState<'upload' | 'visualize'>('upload');

    return (
        <div className="h-screen bg-black text-white overflow-hidden relative">

            {/* Header Overlay */}
            <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-black" />
                    </div>
                    <span className="font-display text-xl tracking-wider">AETHELON <span className="text-white/60">VISION</span></span>
                </div>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                    Exit Experience <X className="w-4 h-4" />
                </button>
            </header>

            {mode === 'upload' ? (
                <div className="h-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600210492486-bccad642388e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-30" />

                    <div className="z-10 text-center max-w-xl px-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-black/60 backdrop-blur-xl border border-white/10 p-12 rounded-3xl"
                        >
                            <h1 className="font-display text-4xl mb-4">Visualize in Your Space</h1>
                            <p className="text-white/60 mb-8">
                                Upload a photo of your room or use our sample environments to see Aethelon furniture in context.
                            </p>

                            <div className="grid gap-4">
                                <button
                                    onClick={() => setMode('visualize')}
                                    className="bg-accent text-black w-full py-4 rounded-xl font-bold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-5 h-5" /> Upload Photo
                                </button>
                                <button
                                    onClick={() => setMode('visualize')}
                                    className="bg-white/10 text-white w-full py-4 rounded-xl font-medium hover:bg-white/20 transition-colors"
                                >
                                    Use Sample Living Room
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            ) : (
                <div className="h-full relative">
                    {/* Main Canvas Area */}
                    <div className="absolute inset-0 bg-neutral-800">
                        <Image
                            src="https://images.unsplash.com/photo-1600210492486-bccad642388e?q=80&w=2574&auto=format&fit=crop"
                            alt="Room"
                            fill
                            className="object-cover opacity-80"
                            priority
                        />

                        {/* 3D Object Overlay Mockup */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[300px] border-2 border-accent/50 rounded-lg flex items-center justify-center bg-accent/5 backdrop-blur-[2px]">
                            <div className="text-accent font-display text-2xl drop-shadow-md">Copenhagen Sectional (3D Model)</div>

                            {/* Control Handles */}
                            <div className="absolute -top-3 -left-3 w-6 h-6 bg-white rounded-full border-4 border-accent shadow-lg cursor-nw-resize" />
                            <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full border-4 border-accent shadow-lg cursor-se-resize" />

                            <div className="absolute top-full mt-4 flex gap-2 bg-black/80 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                                <button className="p-2 hover:text-accent transition-colors"><RotateCw className="w-5 h-5" /></button>
                                <div className="w-px h-6 bg-white/20" />
                                <button className="p-2 hover:text-accent transition-colors"><Sun className="w-5 h-5" /></button>
                                <button className="p-2 hover:text-accent transition-colors"><Moon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Toolbar */}
                    <div className="absolute left-6 top-24 bottom-24 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <h3 className="font-display text-lg">Products</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {['Sofa', 'Armchair', 'Coffee Table', 'Lamp'].map((item) => (
                                <div key={item} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl cursor-grab active:cursor-grabbing border border-transparent hover:border-white/20 transition-all flex gap-3 items-center">
                                    <div className="w-16 h-12 bg-white/10 rounded-md" />
                                    <div>
                                        <div className="font-medium text-sm">{item}</div>
                                        <div className="text-xs text-white/50">$1,200</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Properties Panel */}
                    <div className="absolute right-6 top-24 bottom-24 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col">
                        <div className="p-6">
                            <h2 className="font-display text-2xl mb-1">Copenhagen</h2>
                            <p className="text-white/60 text-sm mb-6">Velvet Sectional Sofa</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-white/40 mb-3 block">Material</label>
                                    <div className="flex gap-2">
                                        <button className="w-8 h-8 rounded-full bg-[#1A5276] border-2 border-white ring-2 ring-accent ring-offset-2 ring-offset-black" title="Velvet Blue" />
                                        <button className="w-8 h-8 rounded-full bg-[#5D6D7E] border border-white/20 hover:scale-110 transition-transform" />
                                        <button className="w-8 h-8 rounded-full bg-[#A04000] border border-white/20 hover:scale-110 transition-transform" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase tracking-wider text-white/40 mb-3 block">Dimensions</label>
                                    <div className="flex bg-white/5 rounded-lg p-1">
                                        <button className="flex-1 py-1.5 text-xs font-medium bg-white/10 rounded shadow-sm">3-Seater</button>
                                        <button className="flex-1 py-1.5 text-xs font-medium text-white/60 hover:text-white">L-Shape</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-6 border-t border-white/10 bg-white/5">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-white/60 text-sm">Total</span>
                                <span className="font-display text-2xl text-accent">$4,850</span>
                            </div>
                            <button className="w-full bg-accent text-black font-bold py-3 rounded-xl hover:bg-accent/90 transition-colors shadow-[0_0_20px_rgba(201,145,43,0.3)]">
                                Add to Room
                            </button>
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex gap-6 items-center">
                        <button className="text-sm font-medium hover:text-accent transition-colors">Undo</button>
                        <div className="w-px h-4 bg-white/20" />
                        <button className="text-sm font-medium hover:text-accent transition-colors">Redo</button>
                        <div className="w-px h-4 bg-white/20" />
                        <button className="flex items-center gap-2 text-accent font-medium">
                            <Sparkles className="w-4 h-4" /> AI Suggest
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
