import Prisma from "@/lib/db";
export const dynamic = "force-dynamic";
import { formatPrice } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

async function getOrders() {
    const orders = await Prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            User: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            },
        },
    });
    return orders;
}

export default async function OrdersPage() {
    const orders: any[] = await getOrders();

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">Orders</h2>

            <Card className="bg-card border border-border overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Order ID</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Customer</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Status</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">Total</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} className="border-border hover:bg-muted/30 transition-colors">
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {order.id}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">{order.User?.firstName} {order.User?.lastName}</span>
                                        <span className="text-xs text-muted-foreground">{order.User?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium uppercase tracking-wide border
                                        ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                                order.status === 'pending' ? 'bg-zinc-100 text-zinc-600 border-zinc-200' :
                                                    'bg-red-100 text-red-700 border-red-200'}`}>
                                        {order.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-foreground">
                                    {formatPrice(order.amount / 100)}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
