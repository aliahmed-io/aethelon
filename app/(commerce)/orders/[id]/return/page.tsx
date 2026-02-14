import Prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requestReturn } from "@/app/dashboard/orders/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function ReturnPage({ params }: { params: { id: string } }) {
    const user = await requireUser();
    const order = await Prisma.order.findUnique({
        where: { id: params.id },
        include: { orderItems: true }
    });

    if (!order) return notFound();
    if (order.userId !== user.id) return redirect("/orders"); // Security check
    if (order.status === "REFUNDED" || order.status === "CANCELLED") {
        return (
            <div className="container max-w-2xl py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Cannot Return this Order</h1>
                <p>This order has already been refunded or cancelled.</p>
            </div>
        );
    }

    async function submitReturn(formData: FormData) {
        "use server";
        await requestReturn(formData);
        redirect("/orders"); // Simple UX: Redirect to orders list
    }

    return (
        <div className="container max-w-2xl py-12 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Start a Return</h1>
                <p className="text-muted-foreground mt-2">
                    Select items you wish to return from Order #{order.id.slice(0, 8)}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={submitReturn} className="space-y-6">
                        <input type="hidden" name="orderId" value={order.id} />

                        <div className="space-y-4">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border p-4 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{formatPrice(item.price / 100)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Label htmlFor={`qty-${item.productId}`} className="text-xs uppercase font-bold text-muted-foreground">return qty</Label>
                                        <Input
                                            type="number"
                                            name={`item_${item.productId}`}
                                            min="0"
                                            max={item.quantity}
                                            defaultValue="0"
                                            className="w-20"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Return</Label>
                            <select
                                name="reason"
                                id="reason"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="">Select a reason...</option>
                                <option value="defective">Defective / Damaged</option>
                                <option value="wrong_item">Received Wrong Item</option>
                                <option value="changed_mind">Changed Mind</option>
                                <option value="size_fit">Size / Fit Issue</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="comments">Additional Comments</Label>
                            <Textarea name="comments" placeholder="Optional details..." />
                        </div>

                        <Button type="submit" className="w-full" size="lg">Submit Return Request</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
