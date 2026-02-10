"use client";

import { motion } from "framer-motion";
import WatchViewer from "./WatchViewer";

const specs = [
    { label: "CASE", value: "Ceratanium® case" },
    { label: "DIAMETER", value: "41.0 mm" },
    { label: "HEIGHT", value: "14.5 mm" },
    { label: "WATER RESISTANCE", value: "10.0 bar" },
    { label: "MOVEMENT", value: "V-900 Calibre" },
    { label: "POWER RESERVE", value: "46 hours" },
    { label: "WINDING", value: "Automatic" },
    { label: "FREQUENCY", value: "28800.0 vph (4.0 Hz)" },
    { label: "JEWELS", value: "33" },
    { label: "STRAP", value: "Black rubber strap with textile inlay" },
];

export default function SpecsGrid() {
    return (
        <section className="relative z-10 bg-background py-32 px-6 md:px-12 border-t border-border">
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-foreground text-4xl md:text-5xl font-bold tracking-tighter mb-12"
                >
                    TECHNICAL SPECIFICATIONS
                </motion.h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Column 1: 3D Model */}
                    <div className="lg:col-span-1 order-2 lg:order-1 border border-border rounded-2xl bg-muted overflow-hidden h-[500px] flex items-center justify-center relative">
                        <WatchViewer />
                    </div>

                    {/* Column 2: The Grid */}
                    <div className="lg:col-span-1 order-1 lg:order-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                        {specs.map((spec, index) => (
                            <motion.div
                                key={spec.label}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="group border-b border-border py-2 hover:border-accent/40 transition-colors cursor-default"
                            >
                                <span className="block text-xs font-bold tracking-widest text-muted-foreground mb-1 group-hover:text-accent transition-colors">{spec.label}</span>
                                <span className="block text-xl text-foreground font-light tracking-tight group-hover:translate-x-1 transition-transform">{spec.value}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
