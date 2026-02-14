import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, AlertTriangle } from "lucide-react";
import Prisma from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { FulfillmentModal } from "../components/FulfillmentModal";
import { RefundButton } from "../components/RefundButton";
import { PrintLabelButton } from "../components/PrintLabelButton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getOrder(id: string) {
    const order = await Prisma.order.findUnique({
        where: { id },
        include: {
            User: true,
            orderItems: true,
            shipments: {
                include: { items: true }
            },
            payment: true
        }
    });

    if (!order) return null;
    return order;
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const order = await getOrder(params.id);

    if (!order) {
        return notFound();
    }

    // Calculate shipped quantities
    const shippedQuantities: Record<string, number> = {};
    order.shipments.forEach(shipment => {
        shipment.items.forEach(item => {
            shippedQuantities[item.orderItemId] = (shippedQuantities[item.orderItemId] || 0) + item.quantity;
        });
    });

    const itemsWithShipping = order.orderItems.map(item => ({
        ...item,
        shippedQuantity: shippedQuantities[item.id] || 0
    }));

    const allFulfilled = itemsWithShipping.every(i => i.shippedQuantity >= i.quantity);
    const partlyFulfilled = itemsWithShipping.some(i => i.shippedQuantity > 0);
    const labelUrl = order.shipments.find(s => s.labelUrl)?.labelUrl;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/orders">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold tracking-tight">Order #{order.id.slice(0, 8)}</h2>
                            <Badge variant={
                                order.status === "PAID" ? "default" :
                                    order.status === "SHIPPED" ? "success" : // Assuming configured
                                        order.status === "CANCELLED" ? "destructive" : "secondary"
                            }>
                                {order.status}
                            </Badge>
                            <Badge variant={
                                order.paymentStatus === "COMPLETED" ? "outline" : "destructive"
                            }>
                                Payment: {order.paymentStatus}
                            </Badge>
                            <Badge variant={order.fulfillmentStatus === "FULFILLED" ? "success" : "secondary"}>
                                {order.fulfillmentStatus}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.createdAt).toLocaleString()} via Online Store
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Print Order
                    </Button>
                    <PrintLabelButton orderId={order.id} hasLabel={!!labelUrl} labelUrl={labelUrl} />
                    {!allFulfilled && order.status !== "CANCELLED" && (
                        <FulfillmentModal orderId={order.id} items={itemsWithShipping} />
                    )}
                    {order.status !== "REFUNDED" && order.status !== "CANCELLED" && (
                        <RefundButton orderId={order.id} />
                    )}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content: Items and Shipments */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Unfulfilled Items Alert */}
                    {!allFulfilled && order.status !== "CANCELLED" && (
                        <div className="flex items-center p-4 text-sm bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-500">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            {partlyFulfilled ? "This order is partially fulfilled." : "This order is unfulfilled."}
                        </div>
                    )}

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Shipped</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {itemsWithShipping.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-muted-foreground hidden sm:block">SKU: {item.productId?.slice(0, 8)}</div>
                                            </TableCell>
                                            <TableCell className="text-right">{formatPrice(item.price / 100)}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{item.shippedQuantity}</TableCell>
                                            <TableCell className="text-right font-medium">{formatPrice((item.price * item.quantity) / 100)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex justify-end p-4 border-t">
                                <div className="text-right space-y-2">
                                    <div className="flex justify-between gap-12 text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatPrice(order.amount / 100)}</span>
                                    </div>
                                    <div className="flex justify-between gap-12 text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span>{formatPrice(order.shippingCost / 100)}</span>
                                    </div>
                                    <div className="flex justify-between gap-12 font-bold text-lg pt-2 border-t mt-2">
                                        <span>Total</span>
                                        <span>{formatPrice((order.amount + order.shippingCost) / 100)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipments */}
                    {order.shipments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tracking #</TableHead>
                                            <TableHead>Carrier</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.shipments.map(shipment => (
                                            <TableRow key={shipment.id}>
                                                <TableCell className="font-mono">{shipment.trackingNumber}</TableCell>
                                                <TableCell>{shipment.carrier}</TableCell>
                                                <TableCell>{new Date(shipment.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>{shipment.items.length} items</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{shipment.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar: Customer Info */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="font-medium mb-1">{order.User?.firstName} {order.User?.lastName}</div>
                                <div className="text-sm text-blue-500 hover:underline cursor-pointer">{order.userId}</div>
                            </div>
                            <div className="border-t pt-4">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact Info</div>
                                <div className="text-sm">{order.User?.email}</div>
                            </div>
                            <div className="border-t pt-4">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Shipping Address</div>
                                <div className="text-sm space-y-1">
                                    <p>{order.shippingName || (order.User?.firstName + ' ' + order.User?.lastName)}</p>
                                    {order.shippingStreet1 && <p>{order.shippingStreet1}</p>}
                                    {order.shippingStreet2 && <p>{order.shippingStreet2}</p>}
                                    {order.shippingCity && <p>{order.shippingCity}, {order.shippingState} {order.shippingPostalCode}</p>}
                                    {order.shippingCountry && <p>{order.shippingCountry}</p>}
                                    {!order.shippingStreet1 && <p className="text-muted-foreground italic">No address provided</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
