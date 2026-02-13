"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { refundOrder } from "../actions";
import { toast } from "sonner";

export function RefundButton({ orderId }: { orderId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleRefund = async () => {
        if (!confirm("Are you sure you want to refund this order? This action handles Stripe, Inventory, and Email notification.")) {
            return;
        }

        const formData = new FormData();
        formData.append("orderId", orderId);

        startTransition(async () => {
            const result = await refundOrder(formData);
            if (result.message.includes("success")) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleRefund}
            disabled={isPending}
        >
            <RotateCcw className="w-4 h-4" />
            {isPending ? "Processing..." : "Refund Order"}
        </Button>
    );
}
