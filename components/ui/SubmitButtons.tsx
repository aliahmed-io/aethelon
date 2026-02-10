"use client";

import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
}

export function SubmitButton({ text, variant = "default", className, ...props }: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <Button
            disabled={pending}
            variant={variant}
            className={cn("relative overflow-hidden transition-all duration-300", className)}
            {...props}
        >
            {pending && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit/50 backdrop-blur-[1px]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                </div>
            )}
            <span className={cn("flex items-center gap-2", pending ? "opacity-0" : "opacity-100")}>
                {text}
            </span>
        </Button>
    );
}

export function ShoppingBagButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            size="lg"
            className="w-full relative group overflow-hidden bg-white text-black hover:bg-white/90 rounded-sm h-12 text-xs font-bold uppercase tracking-widest"
            disabled={pending}
        >
            {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <span className="flex items-center justify-center gap-2">
                    <ShoppingBag className="w-4 h-4 mb-0.5" />
                    Add to Customer Cart
                </span>
            )}
        </Button>
    );
}

export function DeleteItem() {
    const { pending } = useFormStatus();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            disabled={pending}
        >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
    );
}

export function CheckoutButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            size="lg"
            className="w-full bg-white text-black hover:bg-white/90 rounded-sm h-12 text-xs font-bold uppercase tracking-widest"
            disabled={pending}
        >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Checkout <ArrowRight className="w-4 h-4 ml-2" /></>}
        </Button>
    );
}
