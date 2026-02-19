import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/db";
import { getCartRecoveryStats, deleteAbandonedCart } from "./actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ShoppingCart,
    CheckCircle2,
    Clock,
    DollarSign,
    Percent,
    Trash2,
} from "lucide-react";

function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
}

export default async function CartRecoveryPage() {
    await requireAdmin();

    const [stats, carts] = await Promise.all([
        getCartRecoveryStats(),
        prisma.abandonedCart.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
        }),
    ]);

    const statCards = [
        {
            label: "Total Abandoned (30d)",
            value: stats.total.toString(),
            icon: ShoppingCart,
        },
        {
            label: "Recovered",
            value: stats.recovered.toString(),
            icon: CheckCircle2,
        },
        {
            label: "Pending Recovery",
            value: stats.pending.toString(),
            icon: Clock,
        },
        {
            label: "Recovery Rate",
            value: `${stats.recoveryRate}%`,
            icon: Percent,
        },
        {
            label: "Abandoned Value",
            value: formatPrice(stats.abandonedValue),
            icon: DollarSign,
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-border pb-4">
                <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">
                    Cart Recovery
                </h2>
                <span className="text-xs font-mono text-muted-foreground">
                    Cron: Hourly
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {statCards.map((stat) => (
                    <Card
                        key={stat.label}
                        className="p-4 bg-card border-border"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {stat.label}
                            </span>
                        </div>
                        <div className="text-2xl font-light text-foreground">
                            {stat.value}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">
                                Email
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-center">
                                Items
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">
                                Value
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-center">
                                Emails Sent
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-center">
                                Status
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">
                                Created
                            </TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {carts.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground py-12"
                                >
                                    No abandoned carts found
                                </TableCell>
                            </TableRow>
                        ) : (
                            carts.map((cart: { id: string; email: string; itemCount: number; totalCents: number; emailsSent: number; recoveredAt: Date | null; createdAt: Date }) => {
                                const isRecovered = !!cart.recoveredAt;
                                const isExpired =
                                    !isRecovered && cart.emailsSent >= 2;

                                return (
                                    <TableRow
                                        key={cart.id}
                                        className="border-border"
                                    >
                                        <TableCell className="font-mono text-sm text-foreground">
                                            {cart.email}
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground">
                                            {cart.itemCount}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm text-foreground">
                                            {formatPrice(cart.totalCents)}
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground">
                                            {cart.emailsSent}/2
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium uppercase tracking-wide border ${isRecovered
                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                    : isExpired
                                                        ? "bg-red-100 text-red-700 border-red-200"
                                                        : "bg-amber-100 text-amber-700 border-amber-200"
                                                    }`}
                                            >
                                                {isRecovered
                                                    ? "Recovered"
                                                    : isExpired
                                                        ? "Expired"
                                                        : "Pending"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm">
                                            {formatRelativeTime(
                                                cart.createdAt
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <form
                                                action={deleteAbandonedCart.bind(
                                                    null,
                                                    cart.id
                                                )}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="submit"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
