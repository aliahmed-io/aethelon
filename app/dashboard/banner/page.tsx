import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil } from "lucide-react";
import Prisma from "@/lib/db";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getBanners() {
    return await Prisma.banner.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export default async function BannerPage() {
    const banners = await getBanners();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">Banners</h2>
                <Link href="/dashboard/banner/create">
                    <Button className="font-bold uppercase tracking-widest gap-2 bg-foreground text-background hover:bg-foreground/90">
                        <PlusCircle className="w-4 h-4" /> Create Banner
                    </Button>
                </Link>
            </div>

            <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Image</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Title</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">Link</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {banners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                    No banners found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            banners.map((banner) => (
                                <TableRow key={banner.id} className="border-border hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="relative w-48 h-20 bg-muted rounded-sm overflow-hidden border border-border">
                                            <Image src={banner.imageString} alt={banner.title} fill className="object-cover" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">{banner.title}</TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground font-mono">{banner.link || "/"}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/dashboard/banner/${banner.id}`} className="text-amber-400 hover:underline flex items-center justify-end gap-1 text-xs uppercase tracking-wider">
                                            <Pencil className="w-3 h-3" /> Edit
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
