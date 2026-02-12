"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { restockProduct } from "../actions";
import { Plus } from "lucide-react";

export function RestockModal({ productId, currentStock }: { productId: string, currentStock: number }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Plus className="w-3 h-3" />
                    Stock
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={async (formData) => {
                    await restockProduct(null, formData);
                    setOpen(false);
                }}>
                    <DialogHeader>
                        <DialogTitle>Restock Inventory</DialogTitle>
                        <DialogDescription>
                            Add stock to this product. Current level: {currentStock}
                        </DialogDescription>
                    </DialogHeader>

                    <input type="hidden" name="productId" value={productId} />

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantity" className="text-right">
                                Quantity
                            </Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="1"
                                className="col-span-3"
                                placeholder="Amount to add"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reason" className="text-right">
                                Reason
                            </Label>
                            <Input
                                id="reason"
                                name="reason"
                                placeholder="Restock shipment, correction..."
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Stock</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
