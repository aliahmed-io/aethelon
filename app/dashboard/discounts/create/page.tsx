"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Loader2, Shuffle } from "lucide-react";
import Link from "next/link";
import { createDiscount } from "../actions";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="h-12 px-8 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-foreground/90"
        >
            {pending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Create Discount
        </Button>
    );
}

function generateCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export default function CreateDiscountPage() {
    const [state, dispatch] = useActionState(createDiscount, null);
    const [code, setCode] = useState("");

    return (
        <form action={dispatch} className="relative z-0">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/discounts" className="p-2 border border-border rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-light tracking-tight uppercase text-foreground">
                    New Discount
                </h1>
                <div className="ml-auto">
                    <SubmitButton />
                </div>
            </div>

            {state && "error" in state && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                    {state.error}
                </div>
            )}

            <div className="max-w-2xl space-y-8">
                <div className="bg-card border border-border p-8 rounded-sm space-y-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70 mb-4 border-b border-border pb-4">
                        Discount Details
                    </h3>

                    <div className="space-y-3">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">Code</Label>
                        <div className="flex gap-2">
                            <Input
                                name="code"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="h-12 border-border focus:border-accent/50 transition-colors font-mono tracking-widest uppercase"
                                placeholder="e.g. WELCOME10"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 px-4 border-border hover:bg-muted"
                                onClick={() => setCode(generateCode())}
                            >
                                <Shuffle className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Customers will enter this code at checkout.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Type</Label>
                            <Select name="type" defaultValue="PERCENTAGE">
                                <SelectTrigger className="h-12 border-border">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover text-popover-foreground border-border">
                                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                    <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Amount</Label>
                            <Input
                                name="amount"
                                type="number"
                                required
                                min={1}
                                className="h-12 border-border focus:border-accent/50 font-mono"
                                placeholder="e.g. 10"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">Expiry Date (Optional)</Label>
                        <Input
                            name="expiresAt"
                            type="date"
                            className="h-12 border-border focus:border-accent/50"
                        />
                        <p className="text-[10px] text-muted-foreground">Leave blank for no expiration.</p>
                    </div>
                </div>
            </div>
        </form>
    );
}
