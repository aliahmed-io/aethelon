import Prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
export const dynamic = "force-dynamic";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

async function getUserOrders(userId: string) {
    const orders = await Prisma.order.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
        include: {
            User: true
        }
    });
    return orders;
}

type OrderWithUser = Awaited<ReturnType<typeof getUserOrders>>[number];

export default async function AccountPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const orders = await getUserOrders(user?.id as string);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-light tracking-tight uppercase border-b border-border pb-4">Order History</h1>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border mr-auto ml-auto border-dashed border-border rounded-sm">
                    <p className="text-muted-foreground mb-4">No orders found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: OrderWithUser) => (
                        <Card key={order.id} className="bg-muted/50 border-border text-foreground backdrop-blur-sm overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border py-4 px-6 flex flex-row items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
                                    <p className="font-mono text-sm uppercase">{order.id.slice(0, 8)}...</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                                    <p className="font-mono text-sm font-bold">{formatPrice(order.amount / 100)}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Badge className={`uppercase tracking-wide text-[10px] border
                                            ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                order.status === 'shipped' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                    order.status === 'pending' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                            {order.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {/* Future: Add 'View Details' button here */}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
