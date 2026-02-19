import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import prisma from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toggleDiscount, deleteDiscount } from "./actions";

export const dynamic = "force-dynamic";

async function getDiscounts() {
    return prisma.discount.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { orders: true } },
        },
    });
}

type DiscountRow = {
    id: string;
    code: string;
    amount: number;
    type: string;
    active: boolean;
    expiresAt: Date | null;
    createdAt: Date;
    _count: { orders: number };
};

export default async function DiscountsPage() {
    const discounts = await getDiscounts();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">Discounts</h2>
                <Link href="/dashboard/discounts/create">
                    <Button className="font-bold uppercase tracking-widest gap-2 bg-foreground text-background hover:bg-foreground/90">
                        <PlusCircle className="w-4 h-4" /> Add Discount
                    </Button>
                </Link>
            </div>

            <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Code</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Type</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">Amount</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-center">Status</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-center">Uses</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">Expires</TableHead>
                            <TableHead className="text-right text-muted-foreground uppercase tracking-widest text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {discounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                                    No discount codes yet. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            (discounts as unknown as DiscountRow[]).map((discount) => {
                                const isExpired = discount.expiresAt && new Date(discount.expiresAt) < new Date();
                                return (
                                    <TableRow key={discount.id} className="border-border hover:bg-muted/30 transition-colors">
                                        <TableCell>
                                            <span className="font-mono font-bold text-foreground tracking-wider">
                                                {discount.code}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
                                                {discount.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-foreground">
                                            {discount.type === "PERCENTAGE"
                                                ? `${discount.amount}%`
                                                : formatPrice(discount.amount)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium uppercase tracking-wide border
                                                ${discount.active && !isExpired
                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                    : "bg-red-100 text-red-700 border-red-200"}`}>
                                                {isExpired ? "Expired" : discount.active ? "Active" : "Inactive"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-sm text-muted-foreground">
                                            {(discount as DiscountRow)._count.orders}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm">
                                            {discount.expiresAt
                                                ? new Date(discount.expiresAt).toLocaleDateString()
                                                : "Never"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="hover:bg-muted text-muted-foreground hover:text-foreground">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-background border-border text-foreground">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-border" />
                                                    <DropdownMenuItem className="focus:bg-muted cursor-pointer p-0">
                                                        <form action={toggleDiscount} className="w-full">
                                                            <input type="hidden" name="id" value={discount.id} />
                                                            <button type="submit" className="w-full text-left px-2 py-1.5 text-sm">
                                                                {discount.active ? "Deactivate" : "Activate"}
                                                            </button>
                                                        </form>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="focus:bg-red-50 text-red-600 focus:text-red-700 cursor-pointer p-0">
                                                        <form action={deleteDiscount} className="w-full">
                                                            <input type="hidden" name="id" value={discount.id} />
                                                            <button type="submit" className="w-full text-left px-2 py-1.5 text-sm">
                                                                Delete
                                                            </button>
                                                        </form>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
