import Link from "next/link";
import prisma from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronLeft, ExternalLink } from "lucide-react";
import { PremiumProductActions } from "./PremiumProductActions";

export const dynamic = "force-dynamic";

function isInPremium(p: { isFeatured: boolean; tags: string[] }) {
    return p.isFeatured || p.tags.includes("premium") || p.tags.includes("rare");
}

export default async function AdminPremiumPage() {
    const products = await prisma.product.findMany({
        where: { status: "published" },
        orderBy: { price: "desc" },
        select: {
            id: true,
            name: true,
            price: true,
            images: true,
            isFeatured: true,
            tags: true,
        },
    });

    const premiumCount = products.filter(isInPremium).length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 border border-border rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-light tracking-tight uppercase text-foreground flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-accent" />
                            Premium Collection
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            Products shown on the <a href="/vault" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">Premium page <ExternalLink className="w-3 h-3" /></a>. Add or remove below.
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">In Premium</p>
                    <p className="text-2xl font-light text-accent">{premiumCount}</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs w-14">Image</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Name</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">Price</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">In Premium</TableHead>
                            <TableHead className="text-right text-muted-foreground uppercase tracking-widest text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => {
                            const inPremium = isInPremium(product);
                            return (
                                <TableRow key={product.id} className="border-border hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="relative w-12 h-12 bg-muted rounded-sm border border-border overflow-hidden">
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs">—</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-foreground">{product.name}</div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-foreground">
                                        {formatPrice(product.price)}
                                    </TableCell>
                                    <TableCell>
                                        {inPremium ? (
                                            <Badge className="bg-accent/20 text-accent border-accent/30 uppercase tracking-wider text-[10px]">
                                                Yes
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">No</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <PremiumProductActions productId={product.id} inPremium={inPremium} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {products.length === 0 && (
                <div className="border border-border rounded-sm bg-muted/30 p-12 text-center">
                    <p className="text-muted-foreground">No published products yet. Add products in Products first.</p>
                    <Link href="/dashboard/products/new">
                        <Button variant="outline" className="mt-4 uppercase tracking-widest">Add Product</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
