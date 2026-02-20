"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface FurnitureFilterBarProps {
    totalCount: number;
    categories: Category[];
    sizes: string[];
}

const PRICE_RANGES = [
    { label: "Under $500", value: "under-500" },
    { label: "$500 - $1,000", value: "500-1000" },
    { label: "$1,000 - $2,500", value: "1000-2500" },
    { label: "$2,500+", value: "over-2500" },
];

const COLORS = [
    { label: "Beige", value: "beige" },
    { label: "Grey", value: "grey" },
    { label: "White", value: "white" },
    { label: "Black", value: "black" },
    { label: "Walnut", value: "walnut" },
    { label: "Oak", value: "oak" },
    { label: "Brown", value: "brown" },
    { label: "Blue", value: "blue" },
    { label: "Green", value: "green" },
];

export function FurnitureFilterBar({ totalCount, categories, sizes }: FurnitureFilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    // Get current values
    const currentCategory = searchParams.get("category") || "all";
    const currentSort = searchParams.get("sort") || "newest"; // Default to newest if empty
    const currentPrice = searchParams.get("price") || "all";
    const currentColor = searchParams.get("color") || "all";
    const currentSize = searchParams.get("size") || "all";

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/shop?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push("/shop");
    };

    const hasActiveFilters = currentPrice !== "all" || currentColor !== "all" || currentSize !== "all" || currentCategory !== "all" || currentSort !== "newest";

    return (
        <div className="border-b border-border pb-6 mb-8 space-y-6">
            {/* Top Row: Categories & Count */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Categories */}
                <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-none mask-image-fade-right">
                    <button
                        onClick={() => updateFilter("category", "all")}
                        className={cn(
                            "px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-200 rounded-sm whitespace-nowrap",
                            currentCategory === "all"
                                ? "text-foreground font-semibold border-b-2 border-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => updateFilter("category", cat.slug)}
                            className={cn(
                                "px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-200 rounded-sm whitespace-nowrap",
                                currentCategory === cat.slug
                                    ? "text-foreground font-semibold border-b-2 border-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Middle Row: Filter Toggle (Left) & Sort/Count (Right) */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left: Filter Toggle */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "h-9 px-4 text-xs uppercase tracking-widest border-border hover:bg-muted/50 transition-colors",
                        (showFilters || hasActiveFilters) && "bg-muted/50 border-foreground/20"
                    )}
                >
                    <SlidersHorizontal size={14} className="mr-2" />
                    Filter By
                    {hasActiveFilters && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-foreground" />}
                </Button>

                {/* Right: Sort & Count */}
                <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-medium hidden sm:inline-block">Sort:</span>
                        <Select value={currentSort} onValueChange={(val) => updateFilter("sort", val)}>
                            <SelectTrigger className="w-[130px] h-8 text-xs bg-transparent border-none shadow-none focus:ring-0 p-0 text-right justify-end gap-1 hover:text-foreground transition-colors">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent align="end">
                                <SelectItem value="newest">New Arrivals</SelectItem>
                                <SelectItem value="best-sellers">Best Sellers</SelectItem>
                                <SelectItem value="top-rated">Top Rated</SelectItem>
                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                <SelectItem value="name-asc">Name: A-Z</SelectItem>
                                <SelectItem value="name-desc">Name: Z-A</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <span className="h-4 w-px bg-border hidden sm:block" />

                    <span className="text-xs tracking-wide tabular-nums whitespace-nowrap">
                        {totalCount} Items
                    </span>
                </div>
            </div>

            {/* Bottom Row: Collapsible Filters */}
            {showFilters && (
                <div className="flex flex-wrap items-center gap-3 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* Brand */}
                    <Select value={searchParams.get("brand") || "all"} onValueChange={(val) => updateFilter("brand", val)}>
                        <SelectTrigger className="w-[140px] h-9 text-xs uppercase tracking-wider bg-background border-border">
                            <SelectValue placeholder="Brand" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            <SelectItem value="Aethelon">Aethelon</SelectItem>
                            <SelectItem value="Hermann Miller">Hermann Miller</SelectItem>
                            <SelectItem value="Knoll">Knoll</SelectItem>
                            <SelectItem value="Vitra">Vitra</SelectItem>
                            <SelectItem value="Generic">Generic</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Price */}
                    <Select value={currentPrice} onValueChange={(val) => updateFilter("price", val)}>
                        <SelectTrigger className="w-[140px] h-9 text-xs uppercase tracking-wider bg-background border-border">
                            <SelectValue placeholder="Price" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Prices</SelectItem>
                            {PRICE_RANGES.map((range) => (
                                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Color */}
                    <Select value={currentColor} onValueChange={(val) => updateFilter("color", val)}>
                        <SelectTrigger className="w-[140px] h-9 text-xs uppercase tracking-wider bg-background border-border">
                            <SelectValue placeholder="Color" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Colors</SelectItem>
                            {COLORS.map((color) => (
                                <SelectItem key={color.value} value={color.value}>{color.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Size */}
                    <Select value={currentSize} onValueChange={(val) => updateFilter("size", val)}>
                        <SelectTrigger className="w-[140px] h-9 text-xs uppercase tracking-wider bg-background border-border">
                            <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sizes</SelectItem>
                            {sizes.map((size) => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Clear */}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-9 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <X size={14} className="mr-1" /> Clear
                        </Button>
                    )}
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="text-xs text-muted-foreground hover:text-foreground">
                        Close
                    </Button>
                </div>
            )}
        </div>
    );
}
