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

async function getProducts() {
    return await Prisma.product.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-light tracking-tight uppercase">Products</h2>
                <Link href="/dashboard/products/new">
                    <Button className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest gap-2">
                        <PlusCircle className="w-4 h-4" /> Add Product
                    </Button>
                </Link>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Image</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Name</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Status</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs text-right">Price</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs text-right">Date</TableHead>
                            <TableHead className="text-right text-white/50 uppercase tracking-widest text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                <TableCell>
                                    <div className="relative w-12 h-12 bg-black/20 rounded-sm">
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover rounded-sm"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-white">{product.name}</div>
                                    <div className="text-xs text-white/40 font-mono hidden md:inline-block">ID: {product.id.slice(0, 8)}...</div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium uppercase tracking-wide border
                                        ${product.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            product.status === 'draft' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {product.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    {formatPrice(product.price)}
                                </TableCell>
                                <TableCell className="text-right text-white/50 text-sm">
                                    {new Date(product.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost" className="hover:bg-white/10 hover:text-white">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem className="focus:bg-white/10 cursor-pointer" asChild>
                                                <Link href={`/dashboard/products/${product.id}`}>Edit</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="focus:bg-red-900/50 text-red-400 focus:text-red-300 cursor-pointer">Delete</DropdownMenuItem>
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
