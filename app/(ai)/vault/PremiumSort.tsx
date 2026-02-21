"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
    { value: "price-desc", label: "Price: High to Low" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "newest", label: "Newest" },
    { value: "name-asc", label: "Name: A–Z" },
] as const;

export function PremiumSort() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sort = searchParams.get("sort") || "price-desc";

    const handleChange = (value: string) => {
        const next = new URLSearchParams(searchParams.toString());
        next.set("sort", value);
        router.push(`/vault?${next.toString()}`);
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Sort</span>
            <Select value={sort} onValueChange={handleChange}>
                <SelectTrigger className="w-[200px] h-9 border-border bg-background text-foreground text-xs uppercase tracking-wider">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                    {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs uppercase tracking-wider">
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
