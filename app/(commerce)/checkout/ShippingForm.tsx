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
import { formatPrice } from "@/lib/utils";
import { ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";

type ShippingFormProps = {
    initialAddress?: Address | null;
    savedAddresses: Address[];
    cartItems: CartItem[];
    discountCode?: string;
    discountPercentage?: number;
};

export function ShippingForm({ initialAddress, savedAddresses, cartItems: _cartItems, discountCode, discountPercentage }: ShippingFormProps) {
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
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    // Calculate totals for mobile summary
    const subtotal = _cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountAmount = discountPercentage ? (subtotal * discountPercentage) / 100 : 0;
    const finalTotal = subtotal - discountAmount;

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

            {/* Mobile Order Summary Toggle */}
            <div className="lg:hidden mb-8 -mx-8 -mt-8 px-8 py-6 bg-muted/80 border-b border-border shadow-sm">
                <button
                    type="button"
                    onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                    className="flex items-center justify-between w-full text-sm font-bold uppercase tracking-widest text-foreground outline-none"
                >
                    <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        {isSummaryOpen ? "Hide Order Summary" : "Show Order Summary"}
                        {isSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                    <span className="text-lg font-mono">{formatPrice(finalTotal)}</span>
                </button>

                {isSummaryOpen && (
                    <div className="mt-6 pt-6 border-t border-border animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="space-y-4 mb-6">
                            {_cartItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 bg-secondary border border-border rounded-sm">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.imageString} alt={item.name} className="object-cover w-full h-full p-1" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium line-clamp-1 max-w-[150px]">{item.name}</span>
                                            <span className="text-muted-foreground text-xs uppercase">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <span className="font-mono">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3 text-sm text-muted-foreground border-t border-border pt-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-mono">{formatPrice(subtotal)}</span>
                            </div>
                            {discountCode && discountPercentage && (
                                <div className="flex justify-between text-accent">
                                    <span>Discount ({discountCode})</span>
                                    <span className="font-mono">-{formatPrice(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="text-xs uppercase">Calc at next step</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
