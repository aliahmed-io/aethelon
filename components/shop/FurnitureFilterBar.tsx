"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

const FURNITURE_CATEGORIES = [
    { label: "All", value: "all" },
    { label: "Living", value: "living" },
    { label: "Dining", value: "dining" },
    { label: "Bedroom", value: "bedroom" },
    { label: "Office", value: "office" },
];

interface FurnitureFilterBarProps {
    totalCount: number;
}

export function FurnitureFilterBar({ totalCount }: FurnitureFilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category") || "all";

    const handleFilter = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all") {
            params.delete("category");
        } else {
            params.set("category", value);
        }
        router.push(`/shop?${params.toString()}`);
    };

    return (
        <div className="border-b border-border pb-4 mb-8">
            {/* Category Tabs */}
            <div className="flex items-center justify-between gap-6 flex-wrap">
                <div className="flex items-center gap-1">
                    <button
                        className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mr-4 border border-border rounded-sm px-3 py-2"
                        aria-label="Filter options"
                    >
                        <SlidersHorizontal size={14} />
                        <span>Filter</span>
                    </button>

                    <nav className="flex items-center gap-1" aria-label="Product categories">
                        {FURNITURE_CATEGORIES.map((cat) => {
                            const isActive = activeCategory === cat.value ||
                                (cat.value === "all" && !searchParams.get("category"));
                            return (
                                <button
                                    key={cat.value}
                                    onClick={() => handleFilter(cat.value)}
                                    className={cn(
                                        "px-4 py-2 text-xs uppercase tracking-widest transition-colors duration-200 rounded-sm",
                                        isActive
                                            ? "text-foreground font-semibold border-b-2 border-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <span className="text-xs text-muted-foreground tracking-wide tabular-nums">
                    Showing 1–{Math.min(totalCount, 24)} of {totalCount.toLocaleString()} item{totalCount !== 1 ? "s" : ""}
                </span>
            </div>
        </div>
    );
}
