"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { addItem } from "@/app/store/actions";
import { toast } from "sonner";
import { SubmitButton } from "@/components/SubmitButtons";

interface AddToCartFormProps {
    productId: string;
    sizes: string[];
    price: number;
    discountPercentage: number;
    stockQuantity: number;
}

export function AddToCartForm({ productId, sizes, price: _price, discountPercentage: _discountPercentage, stockQuantity }: AddToCartFormProps) {
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);

    const isOutOfStock = stockQuantity <= 0;

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const clientAction = async (formData: FormData) => {
        if (isOutOfStock) {
            toast.error("This product is out of stock");
            return;
        }
        if (!selectedSize) {
            toast.error("Please select a size");
            return;
        }

        // Append client state to formData
        formData.set("size", selectedSize);
        formData.set("quantity", quantity.toString());

        try {
            await addItem(productId, formData);
            toast.success("Added to bag!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to add item to bag";
            toast.error(message);
        }
    };

    return (
        <form action={clientAction}>

            {/* Size Selector */}
            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Size</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                    {sizes && sizes.length > 0 ? (
                        sizes.map((size) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => setSelectedSize(size)}
                                className={`min-w-[44px] h-9 px-3 flex items-center justify-center text-sm rounded-md border transition-colors
                                    ${selectedSize === size
                                        ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                                        : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
                                    }`}
                            >
                                {size}
                            </button>
                        ))
                    ) : (
                        <p className="text-sm text-red-500">No sizes available.</p>
                    )}
                </div>
                <input type="hidden" name="size" value={selectedSize} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-6">
                {isOutOfStock && (
                    <div className="text-sm text-red-600 font-medium">
                        Out of stock
                    </div>
                )}
                <div className="flex gap-4">
                    {/* Add to Bag */}
                    <SubmitButton
                        text="Add to Bag"
                        startIcon={<ShoppingBag className="h-4 w-4" />}
                        disabled={isOutOfStock}
                        className="flex-1 h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-md"
                    />

                    {/* Quantity Selector */}
                    <div className="h-11 flex items-center bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md px-2">
                        <button
                            type="button"
                            onClick={() => handleQuantityChange(-1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            disabled={quantity <= 1}
                        >
                            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900 dark:text-gray-100 text-sm">{quantity}</span>
                        <button
                            type="button"
                            onClick={() => handleQuantityChange(1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Try On Button */}
                <Button asChild size="lg" variant="secondary" className="w-full h-11 font-semibold bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800 rounded-md">
                    <Link href={`/store/try-on?productId=${productId}`} className="flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 mr-2.5 flex items-center justify-center">
                            <Sparkles className="h-3 w-3 text-yellow-700" />
                        </div>
                        Try On in Dressing Room
                    </Link>
                </Button>
            </div>
        </form>
    );
}
