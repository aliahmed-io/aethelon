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

export function ShippingForm({ initialAddress }: ShippingFormProps) {
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
                        <Input
                            name="firstName"
                            className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                            required
                            placeholder="First Name"
                            defaultValue={initialAddress?.name?.split(" ")?.[0] ?? ""}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">Last Name</Label>
                        <Input
                            name="lastName"
                            className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                            required
                            placeholder="Last Name"
                            defaultValue={initialAddress?.name?.split(" ")?.slice(1).join(" ") ?? ""}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-widest text-muted-foreground">Address</Label>
                    <Input
                        name="street1"
                        className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                        required
                        placeholder="Street Address"
                        defaultValue={initialAddress?.street1 ?? ""}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-widest text-muted-foreground">Apartment, suite, etc. (optional)</Label>
                    <Input
                        name="street2"
                        className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                        placeholder="Apartment, suite, unit, etc."
                        defaultValue={initialAddress?.street2 ?? ""}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">City</Label>
                        <Input
                            name="city"
                            className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                            required
                            placeholder="City"
                            defaultValue={initialAddress?.city ?? ""}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">State / Province</Label>
                        <Input
                            name="state"
                            className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                            required
                            placeholder="State"
                            defaultValue={initialAddress?.state ?? ""}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">Postal Code</Label>
                        <Input
                            name="postalCode"
                            className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                            required
                            placeholder="Postal Code"
                            defaultValue={initialAddress?.postalCode ?? ""}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">Country</Label>
                        <Input
                            name="country"
                            className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                            required
                            placeholder="Country"
                            defaultValue={initialAddress?.country ?? "United States"}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-widest text-muted-foreground">Phone</Label>
                    <Input
                        name="phone"
                        type="tel"
                        className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                        required
                        placeholder="Phone Number"
                        defaultValue={initialAddress?.phone ?? ""}
                    />
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
