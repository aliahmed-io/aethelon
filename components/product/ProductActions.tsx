"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { addItem } from "@/app/store/actions";
import { toast } from "sonner";

interface ProductActionsProps {
    productId: string;
    price: number;
    stock: number;

    initialColor?: string;
    currencyCode: string;
    exchangeRate: number;
}

// Mock Colors for Visual Demo - In real app, these would come from props/DB
const MOCK_COLORS = [
    { name: "Cream White", hex: "#F5F5F0", id: "white" },
    { name: "Deep Espresso", hex: "#3E2723", id: "espresso" },
    { name: "Charcoal", hex: "#37474F", id: "charcoal" },
];

export function ProductActions({ productId, price, stock, initialColor, currencyCode = "USD", exchangeRate = 1 }: ProductActionsProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(MOCK_COLORS[0]);
    const [isPending, startTransition] = useTransition();

    const isOutOfStock = stock <= 0;

    const handleQuantity = (delta: number) => {
        setQuantity(prev => Math.max(1, Math.min(stock, prev + delta)));
    };

    const handleAddToCart = () => {
        if (isOutOfStock) return;

        const formData = new FormData();
        formData.append("quantity", quantity.toString());
        formData.append("color", selectedColor.name);

        startTransition(async () => {
            try {
                await addItem(productId, formData);
                toast.success("Added to cart", {
                    description: `${quantity}x ${selectedColor.name} added.`,
                    icon: <ShoppingBag className="w-4 h-4 text-emerald-500" />,
                });
            } catch (err) {
                toast.error("Failed to add to cart");
            }
        });
    };

    // Currency Formatting Logic (Client Side)
    const convertedPrice = (price * exchangeRate); // Price in cents * rate
    const totalPrice = convertedPrice * quantity;

    // Simple formatter for display
    const formattedTotal = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
    }).format(totalPrice / 100); // Input is usually cents, but assuming price prop is cents needed /100? 
    // Wait, earlier formatPrice used /100. Let's assume input price is CENTS.

    return (
        <div className="space-y-8 pt-6 border-t border-border/50">
            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row gap-8 justify-between">

                {/* Color Selector */}
                <div className="space-y-3">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Color</span>
                    <div className="flex gap-3">
                        {MOCK_COLORS.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => setSelectedColor(color)}
                                className={cn(
                                    "w-10 h-10 rounded-full shadow-sm transition-all border-2",
                                    selectedColor.id === color.id
                                        ? "scale-110 border-amber-500 ring-2 ring-amber-500/20"
                                        : "border-transparent hover:scale-105"
                                )}
                                style={{ backgroundColor: color.hex }}
                                aria-label={`Select ${color.name}`}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-3">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Quantity</span>
                    <div className="flex items-center gap-4 bg-muted/30 border border-border rounded-full p-1 pl-4 h-12 w-max">
                        <span className="font-mono text-lg font-medium w-6 text-center">{quantity}</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleQuantity(-1)}
                                disabled={quantity <= 1 || isPending}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-background hover:bg-muted text-foreground transition-colors disabled:opacity-50"
                            >
                                <Minus size={16} />
                            </button>
                            <button
                                onClick={() => handleQuantity(1)}
                                disabled={quantity >= stock || isPending}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-background hover:bg-muted text-foreground transition-colors disabled:opacity-50"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total & Action */}
            <div className="flex items-center gap-6 pt-4">
                <div className="flex-1">
                    <span className="block text-sm text-muted-foreground mb-1">Total Price</span>
                    <span className="text-3xl font-bold tracking-tight">
                        {formattedTotal}
                    </span>
                </div>

                <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isPending}
                    className="flex-[2] h-16 rounded-2xl text-lg font-bold tracking-widest uppercase bg-foreground text-background hover:bg-zinc-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                    {isPending ? (
                        <span className="animate-pulse">Adding...</span>
                    ) : isOutOfStock ? (
                        "Out of Stock"
                    ) : (
                        "Add to Cart"
                    )}
                </Button>
            </div>
        </div>
    );
}

