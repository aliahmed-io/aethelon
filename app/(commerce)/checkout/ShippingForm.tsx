"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartItem } from "@/lib/interfaces";
import { checkOut } from "@/app/store/actions";

type ShippingFormProps = {
    initialAddress?: {
        name: string;
        street1: string;
        street2?: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone?: string | null;
    } | null;
    cartItems: CartItem[];
    discountCode?: string;
    discountPercentage?: number;
};

export function ShippingForm({ }: ShippingFormProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-muted/50 border border-border backdrop-blur-sm p-8 rounded-sm relative overflow-hidden"
        >
            {/* Subtle Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-foreground/[0.01] to-transparent pointer-events-none" />

            <h2 className="text-xl font-light mb-6 uppercase tracking-widest">Shipping Details</h2>
            <p className="text-muted-foreground mb-8 text-sm">
                Enter your details below. Payment will be handled securely via Stripe.
            </p>

            <form action={checkOut} className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">First Name</Label>
                        <Input className="bg-background border-border text-foreground focus:border-accent transition-colors h-12" required placeholder="Name" />
                    </div>
                    <div className="space-y-2">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">Last Name</Label>
                        <Input className="bg-background border-border text-foreground focus:border-accent transition-colors h-12" required placeholder="Surname" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-widest text-muted-foreground">Address</Label>
                    <Input className="bg-background border-border text-foreground focus:border-accent transition-colors h-12" required placeholder="Street Address" />
                </div>

                <Button type="submit" className="w-full h-14 bg-accent text-accent-foreground font-bold uppercase tracking-widest hover:bg-accent/90 mt-6 relative overflow-hidden group">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Proceed to Payment <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                </Button>
            </form>
        </motion.div>
    );
}
