"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CollectionFilterBarProps {
    totalCount: number;
    sort?: string;
}

const SORT_OPTIONS = [
    { label: "Relevance", value: "relevance" },
    { label: "Newest Arrivals", value: "newest" },
    { label: "Best Sellers", value: "best-sellers" },
    { label: "Top Rated", value: "top-rated" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Name: A-Z", value: "name-asc" },
    { label: "Name: Z-A", value: "name-desc" },
];

export function CollectionFilterBar({ totalCount }: CollectionFilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "relevance";

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "relevance") {
            params.delete("sort");
        } else {
            params.set("sort", value);
        }
        // Preserve scroll position or not? Usually reset for new sort.
        // But Next.js router.push might scroll to top.
        // We just push.
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-border/50 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* Results Count */}
            <div>
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{totalCount}</span> products
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <Select value={currentSort} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-background">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
