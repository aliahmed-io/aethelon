"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateLabel } from "../actions";
import { Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PrintLabelButtonProps {
    orderId: string;
    hasLabel: boolean;
    labelUrl?: string | null;
}

export function PrintLabelButton({ orderId, hasLabel, labelUrl }: PrintLabelButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleGenerate = () => {
        const formData = new FormData();
        formData.append("orderId", orderId);

        startTransition(async () => {
            const result = await generateLabel(formData);
            if (result.labelUrl) {
                toast.success("Shipping Label Generated");
                window.open(result.labelUrl, "_blank");
            } else {
                toast.error(result.message || "Failed to generate label");
            }
        });
    };

    if (hasLabel && labelUrl) {
        return (
            <Button variant="outline" size="sm" onClick={() => window.open(labelUrl, "_blank")}>
                <Printer className="mr-2 h-4 w-4" />
                Reprint Label
            </Button>
        );
    }

    return (
        <Button
            variant="default"
            size="sm"
            onClick={handleGenerate}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Printer className="mr-2 h-4 w-4" />
                    Generate Label
                </>
            )}
        </Button>
    );
}
