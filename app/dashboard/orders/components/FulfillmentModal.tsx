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
import { fulfillOrder } from "../actions";
import { Package } from "lucide-react";
import { useFormStatus } from "react-dom";

type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    shippedQuantity: number; // Calculated passed from parent
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Creating Shipment..." : "Create Shipment"}
        </Button>
    );
}

export function FulfillmentModal({ orderId, items }: { orderId: string, items: OrderItem[] }) {
    const [open, setOpen] = useState(false);

    // simple form action wrapper to close modal on success would be nice, 
    // but for now native form action is robust. 
    // We can use a client action wrapper if needed.

    const shippableItems = items.filter(i => i.quantity - i.shippedQuantity > 0);

    if (shippableItems.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Package className="w-4 h-4" />
                    Fulfill Order
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={async (formData) => {
                    await fulfillOrder(null, formData);
                    setOpen(false);
                }}>
                    <DialogHeader>
                        <DialogTitle>Create Shipment</DialogTitle>
                        <DialogDescription>
                            Select items to verify and ship. Enter tracking details.
                        </DialogDescription>
                    </DialogHeader>

                    <input type="hidden" name="orderId" value={orderId} />

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tracking" className="text-right">
                                Tracking #
                            </Label>
                            <Input
                                id="tracking"
                                name="trackingNumber"
                                placeholder="1Z999..."
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="carrier" className="text-right">
                                Carrier
                            </Label>
                            <Input
                                id="carrier"
                                name="carrier"
                                placeholder="UPS, FedEx..."
                                className="col-span-3"
                                required
                            />
                        </div>

                        <div className="space-y-4 mt-4">
                            <h4 className="font-medium text-sm">Items to Ship</h4>
                            {shippableItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-4 border p-2 rounded-sm">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Ordered: {item.quantity} | Shipped: {item.shippedQuantity}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`qty-${item.id}`} className="sr-only">Qty</Label>
                                        <Input
                                            id={`qty-${item.id}`}
                                            name={`item_${item.id}`}
                                            type="number"
                                            min="0"
                                            max={item.quantity - item.shippedQuantity}
                                            defaultValue={item.quantity - item.shippedQuantity}
                                            className="w-16 h-8 text-right"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
