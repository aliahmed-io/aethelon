"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TouchGalleryProps {
    images: string[];
    altTitle: string;
}

export function TouchGallery({ images, altTitle }: TouchGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const minSwipeDistance = 50;

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(0);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isSwipeLeft = distance > minSwipeDistance;
        const isSwipeRight = distance < -minSwipeDistance;

        if (isSwipeLeft && currentIndex < images.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
        if (isSwipeRight && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const goToNext = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-white/5 flex items-center justify-center">
                <span className="text-white/20 text-6xl">⌚</span>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Main Image */}
            <div
                ref={containerRef}
                className="aspect-square relative overflow-hidden bg-white/5 cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex transition-transform duration-300 ease-out h-full"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {images.map((image, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0 relative">
                            <Image
                                src={image}
                                alt={`${altTitle} - Image ${index + 1}`}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows (Desktop) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrev}
                            disabled={currentIndex === 0}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/10 hidden md:flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goToNext}
                            disabled={currentIndex === images.length - 1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/10 hidden md:flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Dots Indicator */}
            {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                ? "bg-white w-6"
                                : "bg-white/30 hover:bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Thumbnails (Desktop) */}
            {images.length > 1 && (
                <div className="hidden md:grid grid-cols-6 gap-2 mt-4">
                    {images.slice(0, 6).map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`aspect-square relative overflow-hidden border transition-all ${index === currentIndex
                                ? "border-white"
                                : "border-white/10 hover:border-white/30"
                                }`}
                        >
                            <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Swipe Hint (Mobile) */}
            <p className="text-center text-[10px] text-white/30 uppercase tracking-widest mt-4 md:hidden">
                Swipe to view more
            </p>
        </div>
    );
}
