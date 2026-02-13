"use client";

import { Button } from "@/components/ui/button";
import { WishlistButton } from "./WishlistButton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Box, ShoppingBag, Star } from "lucide-react";

interface iAppProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    discountPercentage: number;
    modelUrl?: string | null;
  };
  priority?: boolean;
}

export function ProductCard({ item, priority = false }: iAppProps) {
  const discountedPrice = item.discountPercentage > 0
    ? Math.round(item.price * (1 - item.discountPercentage / 100))
    : item.price;

  return (
    <div className="group relative w-full max-w-[400px] h-[580px] rounded-[32px] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

      {/* Background Image - Full Cover */}
      <div className="absolute inset-0 bg-zinc-800">
        <Image
          src={item.images[0]}
          alt={item.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover object-center scale-105 transition-transform duration-700 group-hover:scale-110"
          priority={priority}
        />

        {/* Darkening Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80" />
      </div>

      {/* Lighting Effects */}
      {/* Top Left Studio Light */}
      <div className="absolute top-0 left-0 w-full h-2/3 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none mix-blend-overlay opacity-50" />

      {/* Top Left Badges */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        {item.discountPercentage > 0 && (
          <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-none px-3 py-1 text-xs font-bold shadow-lg backdrop-blur-md">
            -{item.discountPercentage}% OFF
          </Badge>
        )}
      </div>

      {/* Top Right Actions */}
      <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-3">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-2 shadow-lg border border-white/10 hover:bg-white/20 transition-colors">
          <WishlistButton productId={item.id} />
        </div>
        {!!item.modelUrl && (
          <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/10 shadow-lg">
            <Box size={14} className="text-amber-400" />
            <span className="text-[10px] font-bold text-white tracking-wider uppercase">AR Ready</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-10 flex flex-col justify-end h-full pointer-events-none">
        <div className="mt-auto pointer-events-auto">
          {/* Title & Reviews */}
          <div className="mb-4">
            <h2 className="text-3xl font-display font-bold text-white mb-2 leading-none tracking-tight">
              {item.name}
            </h2>

            {/* Mock Review Stars for Vibe */}
            <div className="flex items-center gap-1 opacity-80">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={14} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="text-zinc-300 text-xs ml-2 font-medium">(4.9)</span>
            </div>
          </div>

          {/* Description Truncated */}
          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-6 font-light">
            {item.description}
          </p>

          {/* Price Row */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-bold text-white tracking-tight">${discountedPrice}</span>
            {item.discountPercentage > 0 && (
              <span className="text-zinc-500 text-xl line-through decoration-zinc-600 mb-1">${item.price}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <Button asChild className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 rounded-2xl h-14 font-bold text-base transition-colors shadow-lg shadow-white/5">
              <Link href={`/shop/${item.id}`}>
                Add to Cart
              </Link>
            </Button>

            <Button asChild variant="outline" className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl h-14 font-medium backdrop-blur-md">
              <Link href={`/atelier?productId=${item.id}`}>
                <div className="flex items-center gap-2">
                  <Box size={18} />
                  <span>3D View</span>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingProductCard() {
  return (
    <div className="w-full max-w-[400px] h-[580px] rounded-[32px] bg-zinc-900 border border-white/5 animate-pulse overflow-hidden relative">
      <div className="absolute inset-0 bg-zinc-800/50" />
      <div className="absolute bottom-8 left-8 right-8 space-y-4">
        <div className="h-8 bg-white/10 rounded-lg w-3/4" />
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-10 bg-white/5 rounded w-1/2" />
        <div className="flex gap-3 pt-2">
          <div className="h-14 bg-white/10 rounded-2xl flex-1" />
          <div className="h-14 bg-white/5 rounded-2xl flex-1" />
        </div>
      </div>
    </div>
  );
}