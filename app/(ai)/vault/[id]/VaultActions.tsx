"use client";

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { addItem } from "@/app/store/actions";
import { toast } from "sonner";

interface VaultActionsProps {
    productId: string;
    stock: number;
}

export function VaultActions({ productId, stock }: VaultActionsProps) {
    const [isPending, startTransition] = useTransition();
    const [added, setAdded] = useState(false);

    const isOutOfStock = stock <= 0;

    const handleRequest = () => {
        if (isOutOfStock) return;
        const formData = new FormData();
        formData.append("quantity", "1");
        formData.append("color", "");
        formData.append("size", "");

        startTransition(async () => {
            try {
                await addItem(productId, formData);
                setAdded(true);
                toast.success("Piece reserved", {
                    description: "Added to your bag. Complete your request at checkout.",
                });
            } catch {
                toast.error("Reservation failed. Please try again.");
            }
        });
    };

    return (
        <button
            onClick={handleRequest}
            disabled={isOutOfStock || isPending}
            className="group relative inline-flex items-center justify-between gap-6 px-8 py-5 w-full overflow-hidden transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
                border: `1px solid ${added ? "var(--vault-gold)" : "var(--vault-border)"}`,
                background: added ? "var(--vault-gold)" : "transparent",
                color: added ? "var(--vault-bg)" : "var(--vault-fg)",
            }}
            aria-label={isOutOfStock ? "Out of stock" : "Request this piece"}
        >
            {/* Button shimmer on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: "linear-gradient(105deg, transparent 30%, rgba(171,126,34,0.1) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                }}
            />

            <span className="relative text-[11px] font-mono uppercase tracking-[0.25em]">
                {isPending
                    ? "Reserving…"
                    : isOutOfStock
                        ? "Unavailable"
                        : added
                            ? "Reserved — Complete at checkout"
                            : "Request this piece"}
            </span>

            <ArrowRight
                className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                style={{ opacity: isOutOfStock ? 0.4 : 1 }}
            />
        </button>
    );
}
