import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Prisma from "@/lib/db";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

async function getCategories() {
    return await Prisma.category.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-light tracking-tight uppercase">Categories</h2>
                <Link href="/dashboard/categories/new">
                    <Button className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest gap-2">
                        <PlusCircle className="w-4 h-4" /> Add Category
                    </Button>
                </Link>
            </div>

            <Card className="bg-white/5 border border-white/10 overflow-hidden backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Name</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Description</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((cat) => (
                            <TableRow key={cat.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                <TableCell className="font-medium text-white">
                                    {cat.name}
                                </TableCell>
                                <TableCell className="text-white/50 text-sm">
                                    {cat.description}
                                </TableCell>
                                <TableCell className="text-right text-white/50 text-sm">
                                    {new Date(cat.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
