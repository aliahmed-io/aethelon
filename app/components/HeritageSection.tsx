"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function HeritageSection() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-85%"]);

    const stories = [
        {
            year: "1936",
            title: "THE ORIGIN",
            desc: "Velorum creates the first specialized Aviator's Instrument, defining a new standard for flight precision.",
            image: "/assets/heritage/history-1936.jpg"
        },
        {
            year: "1940",
            title: "BIG PILOT",
            desc: "The 52 T.S.C. becomes the largest wristwatch ever produced by Velorum, featuring a central hacking seconds.",
            image: "/assets/heritage/history-1940.avif"
        },
        {
            year: "1948",
            title: "MARK 11",
            desc: "Commissioned for the Royal Air Force, the Mark 11 establishes Velorum as the master of magnetic resistance.",
            image: "/assets/heritage/history-1948.webp"
        },
        {
            year: "2007",
            title: "CHRONO ERA",
            desc: "The introduction of the Double Chronograph splits seconds and defines the modern Velorum aesthetic.",
            image: "/assets/heritage/history-2007.jpeg"
        },
        {
            year: "2022",
            title: "V-DARK ERA",
            desc: "The V-Dark Series introduces Ceratanium®, combining the lightness of titanium with the hardness of ceramic.",
            image: "/assets/heritage/history-2022.webp"
        },
    ];

    return (
        <section ref={targetRef} className="relative z-10 h-[400vh] bg-[#0A0A0C]">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div style={{ x }} className="flex gap-12 px-12 md:px-24">
                    {/* Intro Title */}
                    <div className="flex-shrink-0 w-[80vw] md:w-[40vw] flex flex-col justify-center z-10">
                        <h2 className="text-6xl md:text-9xl font-bold text-white/10 tracking-tighter leading-none mb-4">
                            HERITAGE
                        </h2>
                        <p className="text-xl md:text-2xl text-white ml-2 font-light max-w-md">
                            From the first Special Pilot’s Watch to the era of Ceratanium®.
                        </p>
                    </div>

                    {/* Story Cards */}
                    {stories.map((story) => (
                        <div
                            key={story.year}
                            className="flex-shrink-0 w-[85vw] md:w-[60vw] h-[70vh] md:h-[80vh] relative group overflow-hidden bg-[#050505] border border-white/5"
                        >
                            {/* Background Image */}
                            {story.image ? (
                                <Image
                                    src={story.image}
                                    alt={story.title}
                                    fill
                                    className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-out grayscale group-hover:grayscale-0"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-black" />
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full z-20">
                                <span className="block text-6xl md:text-8xl font-bold text-white/10 mb-2">{story.year}</span>
                                <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">{story.title}</h3>
                                <p className="text-white/70 max-w-lg text-lg leading-relaxed">{story.desc}</p>
                            </div>
                        </div>
                    ))}

                    {/* End Spacer */}
                    <div className="w-[10vw]"></div>
                </motion.div>
            </div>
        </section>
    );
}
