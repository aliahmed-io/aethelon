"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const FILTERS = [
    {
        id: "category",
        name: "FAMILY",
        options: [
            { label: "ALL WATCHES", value: "all" },
            { label: "PILOT'S WATCHES", value: "PILOT" },
            { label: "PORTUGIESER", value: "PORTUGIESER" },
            { label: "PORTOFINO", value: "PORTOFINO" },
        ],
    },
    {
        id: "material",
        name: "MATERIAL",
        options: [
            { label: "CERATANIUM®", value: "ceratanium" },
            { label: "CERAMIC", value: "ceramic" },
            { label: "TITANIUM", value: "titanium" },
            { label: "STEEL", value: "steel" },
        ],
    },
];

export function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all") {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`/shop?${params.toString()}`);
    };

    return (
        <div className="w-64 flex-shrink-0 hidden lg:block sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto pr-8 border-r border-border">
            <div className="space-y-12">
                {FILTERS.map((section) => (
                    <div key={section.id} className="space-y-4">
                        <h3 className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                            {section.name}
                        </h3>
                        <div className="space-y-2">
                            {section.options.map((option) => {
                                const isActive = searchParams.get(section.id) === option.value || (!searchParams.get(section.id) && option.value === "all");
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleFilter(section.id, option.value)}
                                        className={cn(
                                            "block text-sm tracking-wide transition-colors duration-300 text-left w-full hover:text-foreground",
                                            isActive ? "text-foreground font-medium" : "text-muted-foreground"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
