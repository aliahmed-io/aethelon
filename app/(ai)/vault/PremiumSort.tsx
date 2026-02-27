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
            <span
                className="text-[9px] uppercase tracking-[0.25em] font-mono"
                style={{ color: "var(--vault-muted)" }}
            >
                Sort
            </span>
            <Select value={sort} onValueChange={handleChange}>
                <SelectTrigger
                    className="w-[190px] h-8 text-[10px] uppercase tracking-wider font-mono rounded-none border shadow-sm"
                    style={{
                        background: "var(--vault-surface)",
                        borderColor: "var(--vault-gold)",
                        color: "var(--vault-fg)",
                    }}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="rounded-none border z-[200]"
                    style={{
                        background: "var(--vault-surface)",
                        borderColor: "var(--vault-gold)",
                        color: "var(--vault-fg)",
                    }}
                >
                    {SORT_OPTIONS.map((opt) => (
                        <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-[10px] uppercase tracking-wider font-mono focus:bg-[var(--vault-surface-2)] focus:text-[var(--vault-gold)]"
                        >
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
