"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

export function CheckoutButton() {
    const { showDemoNotice } = useAuthPrompt();

    return (
        <Button 
            onClick={() => showDemoNotice("The Checkout and Payment processing flow is disabled in this demo showcase.")}
            className="w-full h-14 bg-accent text-accent-foreground font-bold uppercase tracking-widest hover:bg-accent/90 flex items-center justify-between px-6 transition-all active:scale-[0.98]"
        >
            Checkout <ArrowRight className="w-4 h-4" />
        </Button>
    );
}
