
'use client';

import { Product } from '@prisma/client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface SmartProductGridProps {
    products: Product[];
}

export function SmartProductGrid({ products }: SmartProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="py-20 text-center">
                <p className="text-muted-foreground text-lg">No products found in this collection.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
            ))}
        </div>
    );
}

function ProductCard({ product, index }: { product: Product, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group"
        >
            <Link href={`/product/${product.id}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-muted overflow-hidden rounded-md mb-4">
                    {product.images[0] && (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.stockQuantity === 0 && (
                            <span className="bg-black/80 text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm backdrop-blur-sm">
                                Sold Out
                            </span>
                        )}
                        {(product.staticScore || 0) > 0.8 && (
                            <span className="bg-white/90 text-black text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm backdrop-blur-sm font-medium">
                                Trending
                            </span>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                    <h3 className="text-base font-medium text-foreground group-hover:underline decoration-1 underline-offset-4">
                        {product.name}
                    </h3>

                    <div className="flex items-center justify-between">
                        <p className="text-sm font-light text-muted-foreground">
                            ${(product.price / 100).toLocaleString()}
                        </p>

                        {product.averageRating > 0 && (
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-foreground text-foreground" />
                                <span className="text-xs">{product.averageRating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
