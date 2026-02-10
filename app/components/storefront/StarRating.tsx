import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: number;
    className?: string;
}

export function StarRating({ rating, maxRating = 5, size = 4, className }: StarRatingProps) {
    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            {[...Array(maxRating)].map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        "fill-current transition-colors duration-300",
                        i < Math.round(rating)
                            ? "text-yellow-400"
                            : "text-white/10",
                        `w-${size} h-${size}`
                    )}
                    strokeWidth={1.5}
                    style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
                />
            ))}
        </div>
    );
}
