"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { setProductPremium } from "@/app/actions/premium";
import { Loader2, Sparkles, MinusCircle } from "lucide-react";
import { toast } from "sonner";

export function PremiumProductActions({
    productId,
    inPremium,
}: {
    productId: string;
    inPremium: boolean;
}) {
    const [pending, setPending] = useState(false);

    const handleClick = async () => {
        setPending(true);
        try {
            await setProductPremium(productId, !inPremium);
            toast.success(inPremium ? "Removed from Premium" : "Added to Premium");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to update");
        } finally {
            setPending(false);
        }
    };

    return (
        <Button
            size="sm"
            variant={inPremium ? "outline" : "default"}
            className="uppercase tracking-wider text-xs gap-1.5"
            onClick={handleClick}
            disabled={pending}
        >
            {pending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : inPremium ? (
                <>
                    <MinusCircle className="w-3.5 h-3.5" />
                    Remove
                </>
            ) : (
                <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Add to Premium
                </>
            )}
        </Button>
    );
}
