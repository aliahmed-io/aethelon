import Prisma from "@/lib/db";
import type { Prisma as PrismaType } from "@prisma/client";
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
            User: true,
        }
    });
    return orders as unknown as OrderWithUser[];
}

type OrderWithUser = PrismaType.OrderGetPayload<{ include: { User: true } }>;

export default async function OrdersPage() {
    const orders: OrderWithUser[] = await getOrders();

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-light tracking-tight uppercase">Orders</h2>

            <Card className="bg-white/5 border border-white/10 overflow-hidden backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Order ID</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Customer</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Status</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs text-right">Total</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                <TableCell className="font-mono text-xs text-white/70">
                                    {order.id}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{order.User?.firstName} {order.User?.lastName}</span>
                                        <span className="text-xs text-white/40">{order.User?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium uppercase tracking-wide border
                                        ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            order.status === 'shipped' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                order.status === 'pending' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {order.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold">
                                    {formatPrice(order.amount / 100)}
                                </TableCell>
                                <TableCell className="text-right text-white/50 text-sm">
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
