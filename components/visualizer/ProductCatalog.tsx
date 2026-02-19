"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Search, X, ChevronDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { VisualizerProduct } from "@/components/visualizer/types";

interface ProductCatalogProps {
    products: VisualizerProduct[];
    selectedProduct: VisualizerProduct | null;
    onSelectProduct: (product: VisualizerProduct) => void;
    categories: { id: string; name: string }[];
    categoryFilter: string | null;
    onCategoryChange: (id: string | null) => void;
}

export function ProductCatalog({
    products,
    selectedProduct,
    onSelectProduct,
    categories,
    categoryFilter,
    onCategoryChange,
}: ProductCatalogProps) {
    const [search, setSearch] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    const filtered = search
        ? products.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase())
        )
        : products;

    const activeCategoryName = categoryFilter
        ? categories.find((c) => c.id === categoryFilter)?.name ?? "All"
        : "All Products";

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border space-y-3">
                <h3 className="font-display text-base uppercase tracking-wider">
                    Products
                </h3>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                        ref={searchRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products…"
                        className="w-full pl-9 pr-8 py-2 bg-muted border border-border rounded-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                    />
                    {search && (
                        <button
                            onClick={() => {
                                setSearch("");
                                searchRef.current?.focus();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted-foreground/10 rounded-sm"
                            aria-label="Clear search"
                        >
                            <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                    )}
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-muted border border-border rounded-sm text-sm hover:bg-muted/80 transition-colors"
                        >
                            <span className="text-muted-foreground">
                                {activeCategoryName}
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 text-muted-foreground transition-transform ${isFilterOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-sm shadow-lg z-20 max-h-48 overflow-y-auto">
                                <button
                                    onClick={() => {
                                        onCategoryChange(null);
                                        setIsFilterOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${!categoryFilter
                                            ? "text-accent font-medium"
                                            : "text-foreground"
                                        }`}
                                >
                                    All Products
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            onCategoryChange(cat.id);
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${categoryFilter === cat.id
                                                ? "text-accent font-medium"
                                                : "text-foreground"
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Product List */}
            <div
                className="flex-1 overflow-y-auto p-3 space-y-2"
                role="listbox"
                aria-label="3D Products"
            >
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            No 3D products found
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="mt-2 text-xs text-accent hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    filtered.map((product) => {
                        const isSelected = selectedProduct?.id === product.id;
                        return (
                            <button
                                key={product.id}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => onSelectProduct(product)}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-sm border transition-all text-left group ${isSelected
                                        ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                                        : "border-transparent hover:border-border hover:bg-muted/50"
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div className="relative w-14 h-14 flex-shrink-0 rounded-sm overflow-hidden bg-muted">
                                    {product.images[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="56px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                            3D
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatPrice(product.price / 100)}
                                    </p>
                                </div>

                                {/* Active Indicator */}
                                {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                                )}
                            </button>
                        );
                    })
                )}
            </div>

            {/* Count */}
            <div className="p-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest text-center">
                    {filtered.length} product{filtered.length !== 1 ? "s" : ""}{" "}
                    with 3D models
                </p>
            </div>
        </div>
    );
}
