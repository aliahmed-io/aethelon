"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartItem } from "@/lib/interfaces";
import { checkOut } from "@/app/store/actions";
import { Address } from "@prisma/client";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ShippingFormProps = {
    initialAddress?: Address | null;
    savedAddresses: Address[];
    cartItems: CartItem[];
    discountCode?: string;
    discountPercentage?: number;
};

export function ShippingForm({ initialAddress, savedAddresses, cartItems }: ShippingFormProps) {
    const [selectedAddressId, setSelectedAddressId] = useState<string>(initialAddress?.id || "new");
    const [formValues, setFormValues] = useState({
        firstName: "",
        lastName: "",
        street1: "",
        street2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "United States",
        phone: ""
    });

    // Initialize logic
    useEffect(() => {
        if (initialAddress) {
            updateFormWithAddress(initialAddress);
        }
    }, [initialAddress]);

    const updateFormWithAddress = (address: Address) => {
        const [firstName, ...lastNameParts] = address.name.split(" ");
        setFormValues({
            firstName: firstName || "",
            lastName: lastNameParts.join(" ") || "",
            street1: address.street1,
            street2: address.street2 || "",
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            phone: address.phone || ""
        });
    };

    const handleAddressSelection = (id: string) => {
        setSelectedAddressId(id);
        if (id === "new") {
            setFormValues({
                firstName: "",
                lastName: "",
                street1: "",
                street2: "",
                city: "",
                state: "",
                postalCode: "",
                country: "United States",
                phone: ""
            });
        } else {
            const addr = savedAddresses.find(a => a.id === id);
            if (addr) updateFormWithAddress(addr);
        }
    };

    const handleInputChange = (field: keyof typeof formValues, value: string) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
    };

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

            {savedAddresses.length > 0 && (
                <div className="mb-8">
                    <Label className="uppercase text-xs tracking-widest text-muted-foreground mb-4 block">Saved Addresses</Label>
                    <RadioGroup value={selectedAddressId} onValueChange={handleAddressSelection} className="flex flex-col gap-3">
                        {savedAddresses.map((addr) => (
                            <div key={addr.id} className={`flex items-start space-x-3 border p-4 rounded-sm transition-colors ${selectedAddressId === addr.id ? 'border-accent bg-accent/5' : 'border-border'}`}>
                                <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                                <Label htmlFor={addr.id} className="cursor-pointer flex-1">
                                    <div className="font-bold text-sm uppercase tracking-wide">{addr.name}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {addr.street1}, {addr.city}, {addr.state} {addr.postalCode}
                                    </div>
                                </Label>
                            </div>
                        ))}
                        <div className={`flex items-start space-x-3 border p-4 rounded-sm transition-colors ${selectedAddressId === "new" ? 'border-accent bg-accent/5' : 'border-border'}`}>
                            <RadioGroupItem value="new" id="new-address" className="mt-1" />
                            <Label htmlFor="new-address" className="cursor-pointer font-bold text-sm uppercase tracking-wide">
                                Use a new address
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            )}

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
                            value={formValues.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">Last Name</Label>
                        <Input
                            name="lastName"
                            className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                            required
                            placeholder="Last Name"
                            value={formValues.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
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
                        value={formValues.street1}
                        onChange={(e) => handleInputChange("street1", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-widest text-muted-foreground">Apartment, suite, etc. (optional)</Label>
                    <Input
                        name="street2"
                        className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                        placeholder="Apartment, suite, unit, etc."
                        value={formValues.street2}
                        onChange={(e) => handleInputChange("street2", e.target.value)}
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
                            value={formValues.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">State / Province</Label>
                        <Input
                            name="state"
                            className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                            required
                            placeholder="State"
                            value={formValues.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
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
                            value={formValues.postalCode}
                            onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">Country</Label>
                        <Input
                            name="country"
                            className="bg-background border-border text-foreground focus:border-accent transition-colors h-12"
                            required
                            placeholder="Country"
                            value={formValues.country}
                            onChange={(e) => handleInputChange("country", e.target.value)}
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
                        value={formValues.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                </div>

                {/* Save Address Checkbox */}
                {selectedAddressId === "new" && (
                    <div className="flex items-center space-x-2 pt-4 border-t border-border">
                        <input
                            type="checkbox"
                            name="saveAddress"
                            id="saveAddress"
                            className="accent-accent w-4 h-4 cursor-pointer"
                        />
                        <Label htmlFor="saveAddress" className="text-sm cursor-pointer select-none">Save this address for future use</Label>
                    </div>
                )}


                <Button type="submit" className="w-full h-14 bg-accent text-accent-foreground font-bold uppercase tracking-widest hover:bg-accent/90 mt-6 relative overflow-hidden group">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Proceed to Payment <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                </Button>
            </form>
        </motion.div>
    );
}
