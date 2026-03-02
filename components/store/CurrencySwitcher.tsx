"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { setCurrency } from "@/app/actions/currency";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";

interface CurrencySwitcherProps {
    currentCurrency: string;
}

export function CurrencySwitcher({ currentCurrency }: CurrencySwitcherProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleChange = (value: string) => {
        startTransition(async () => {
            await setCurrency(value);
            window.dispatchEvent(new CustomEvent("currency_changed", { detail: value }));
            router.refresh();
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select
                defaultValue={currentCurrency}
                onValueChange={handleChange}
                disabled={isPending}
            >
                <SelectTrigger className="h-8 w-[80px] text-xs border-none bg-transparent focus:ring-0">
                    <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent align="end">
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
