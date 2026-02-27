
'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CollectionHeroProps {
    title: string;
    description: string;
    image: string;
    breadcrumbs: string[];
}

export function CollectionHero({ title, description, image, breadcrumbs }: CollectionHeroProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden flex items-end">
            {/* Background Image with Parallax-like feel (simple fixed for now) */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 md:px-8 pb-12">
                <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45 }}
                    className="max-w-3xl"
                >
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-white/80 mb-4 capitalize">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={crumb} className="flex items-center gap-2">
                                <span>/</span>
                                <span className={idx === breadcrumbs.length - 1 ? "text-white font-medium" : ""}>
                                    {crumb.replace('-', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white mb-4">
                        {title}
                    </h1>
                    <p className="text-lg text-white/90 max-w-xl leading-relaxed">
                        {description}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
