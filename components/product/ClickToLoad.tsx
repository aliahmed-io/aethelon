"use client";

import { useState, ReactNode } from "react";
import { Box } from "lucide-react";

interface ClickToLoadProps {
    /** Skeleton/placeholder shown before user clicks to load */
    fallback?: ReactNode;
    /** Content to render once activated */
    children: ReactNode;
    /** Accessible label for the load trigger */
    label?: string;
    /** Class name for the container */
    className?: string;
}

/**
 * Click-to-load wrapper for heavy Tier 3 components (3D viewers, AR, etc.).
 * Renders a placeholder until the user explicitly clicks to load,
 * deferring all heavy JS until interaction.
 */
export function ClickToLoad({
    fallback,
    children,
    label = "Load Interactive View",
    className = "",
}: ClickToLoadProps) {
    const [isActive, setIsActive] = useState(false);

    if (isActive) {
        return <>{children}</>;
    }

    return (
        <button
            type="button"
            onClick={() => setIsActive(true)}
            className={`group relative w-full cursor-pointer ${className}`}
            aria-label={label}
        >
            {fallback ?? (
                <div className="aspect-square bg-muted border border-border rounded-sm flex flex-col items-center justify-center gap-4 transition-all hover:border-accent/30 hover:bg-muted/80">
                    <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Box className="w-7 h-7 text-accent/60 group-hover:text-accent transition-colors" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
                        <p className="text-xs text-muted-foreground">Click to activate 3D experience</p>
                    </div>
                </div>
            )}
        </button>
    );
}
