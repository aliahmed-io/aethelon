import Prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
export const dynamic = "force-dynamic";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // Ensure badge exists or inline style
import { Card, CardContent, CardHeader } from "@/components/ui/card";

async function getUserOrders(userId: string) {
    return await Prisma.order.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
        include: {
            User: true
        }
    });
}

export default async function AccountPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const orders = await getUserOrders(user?.id as string);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-light tracking-tight uppercase border-b border-white/5 pb-4">Order History</h1>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border mr-auto ml-auto border-dashed border-white/10 rounded-sm">
                    <p className="text-white/40 mb-4">No orders found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id} className="bg-white/5 border-white/10 text-white backdrop-blur-sm overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5 py-4 px-6 flex flex-row items-center justify-between">
                                <div>
                                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Order ID</p>
                                    <p className="font-mono text-sm uppercase">{order.id.slice(0, 8)}...</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Total</p>
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
                                        <span className="text-xs text-white/40">
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
