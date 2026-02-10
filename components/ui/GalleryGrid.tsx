"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const images = [
    {
        src: "/assets/gallery/gallery_cockpit_1768638690424.png",
        alt: "Pilot's Watch in Cockpit",
        className: "md:col-span-2 md:row-span-2 aspect-[4/3]"
    },
    {
        src: "/assets/gallery/gallery_wrist_luxury_1768638707354.png",
        alt: "Luxury Wrist Shot",
        className: "md:col-span-1 md:row-span-1 aspect-square"
    },
    {
        src: "/assets/gallery/gallery_table_macro_1768638724571.png",
        alt: "Macro Detail Shot",
        className: "md:col-span-1 md:row-span-1 aspect-square"
    }
];

export default function GalleryGrid() {
    return (
        <section className="relative z-10 bg-background py-32 px-6 md:px-12 border-t border-border">
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-foreground text-4xl md:text-5xl font-bold tracking-tighter mb-16 text-right"
                >
                    BUILT FOR THE EXTREME
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                    {images.map((img, idx) => (
                        <motion.div
                            key={idx}
                            className={`relative overflow-hidden rounded-sm group ${img.className}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-foreground/10 group-hover:bg-transparent transition-colors duration-500" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
