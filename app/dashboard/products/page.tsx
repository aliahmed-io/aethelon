import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import Prisma from "@/lib/db";
export const dynamic = "force-dynamic";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { RestockModal } from "./components/RestockModal";

async function getProducts() {
    return await Prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            images: true,
            status: true,
            price: true,
            stockQuantity: true,
            lowStockThreshold: true,
            reservedStock: true,
            createdAt: true,
        }
    });
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">Products</h2>
                <Link href="/dashboard/products/new">
                    <Button className="font-bold uppercase tracking-widest gap-2 bg-foreground text-background hover:bg-foreground/90">
                        <PlusCircle className="w-4 h-4" /> Add Product
                    </Button>
                </Link>
            </div>

            <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Image</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Name</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Status</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">Price</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-center">Stock</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">Date</TableHead>
                            <TableHead className="text-right text-muted-foreground uppercase tracking-widest text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id} className="border-border hover:bg-muted/30 transition-colors">
                                <TableCell>
                                    <div className="relative w-12 h-12 bg-muted rounded-sm border border-border">
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover rounded-sm"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-foreground">{product.name}</div>
                                    <div className="text-xs text-muted-foreground font-mono hidden md:inline-block">ID: {product.id.slice(0, 8)}...</div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium uppercase tracking-wide border
                                        ${product.status === 'published' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            product.status === 'draft' ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                        {product.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-mono text-foreground">
                                    {formatPrice(product.price)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="font-mono text-sm">
                                            {product.stockQuantity}
                                            {product.stockQuantity <= product.lowStockThreshold && (
                                                <Badge variant="destructive" className="ml-2 text-[10px] h-4 px-1">Low</Badge>
                                            )}
                                        </div>
                                        {product.reservedStock > 0 && (
                                            <span className="text-[10px] text-yellow-600 bg-yellow-100 px-1 rounded">
                                                Rsrv: {product.reservedStock}
                                            </span>
                                        )}
                                        <RestockModal productId={product.id} currentStock={product.stockQuantity} />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm">
                                    {new Date(product.createdAt).toLocaleDateString()}
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
                                            <DropdownMenuItem className="focus:bg-muted cursor-pointer" asChild>
                                                <Link href={`/dashboard/products/${product.id}`}>Edit</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="focus:bg-red-50 text-red-600 focus:text-red-700 cursor-pointer">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
