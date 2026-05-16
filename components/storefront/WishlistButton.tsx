
"use client";

import { useTransition, useState, useEffect } from "react";
import { toggleWishlist, getWishlistStatus } from "@/app/store/wishlist/actions";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

interface WishlistButtonProps {
    productId: string;
}

export function WishlistButton({ productId }: WishlistButtonProps) {
    const { showAuthPrompt } = useAuthPrompt();
    const [isPending, startTransition] = useTransition();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getWishlistStatus(productId)
            .then((status) => {
                setIsWishlisted(status);
            })
            .catch(() => {
                setIsWishlisted(false);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [productId]);

    const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isPending) return;

        startTransition(async () => {
            const res = await toggleWishlist(productId);
            if (res.success) {
                setIsWishlisted(res.isWishlisted!);
                toast.success(res.isWishlisted ? "Added to wishlist" : "Removed from wishlist");
            } else {
                if (res.error === "Must be logged in") {
                    showAuthPrompt("Sign in to save this piece to your personal wishlist and track price changes.");
                    return;
                }
                toast.error(res.error || "Something went wrong");
            }
        });
    };

    if (isLoading) {
        return (
            <Button variant="ghost" size="icon" disabled className="rounded-full">
                <Heart className="w-5 h-5 opacity-50" />
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            onTouchEnd={handleToggle}
            disabled={isPending}
            className="rounded-full hover:bg-muted active:scale-95 transition-transform"
        >
            <Heart
                className={cn(
                    "w-5 h-5 transition-colors",
                    isWishlisted ? "fill-accent text-accent" : "text-muted-foreground"
                )}
            />
        </Button>
    );
}
