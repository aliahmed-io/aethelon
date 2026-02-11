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
                <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">Categories</h2>
                <Link href="/dashboard/categories/new">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest gap-2">
                        <PlusCircle className="w-4 h-4" /> Add Category
                    </Button>
                </Link>
            </div>

            <Card className="bg-card border border-border overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50 bg-muted/20">
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs font-medium">Name</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs font-medium">Description</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs font-medium text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((cat: any) => (
                            <TableRow key={cat.id} className="border-border hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium text-foreground">
                                    {cat.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {cat.description}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm font-mono">
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
