"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getListReturn, type ListReturnState } from "@/lib/navigation/list-return";

interface ProductBackLinkProps {
    fallbackHref?: string;
    fallbackLabel?: string;
}

export function ProductBackLink({
    fallbackHref = "/shop",
    fallbackLabel = "Back to Shop",
}: ProductBackLinkProps) {
    const [target, setTarget] = useState<ListReturnState | null>(null);

    useEffect(() => {
        setTarget(getListReturn());
    }, []);

    const href = target?.path ?? fallbackHref;
    const label = target?.label ?? fallbackLabel;

    return (
        <Link
            href={href}
            scroll={false}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
        >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {label}
        </Link>
    );
}
