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
import Image from "next/image";

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
                <h2 className="text-3xl font-light tracking-tight uppercase">Banners</h2>
                <Link href="/dashboard/banner/create">
                    <Button className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest gap-2">
                        <PlusCircle className="w-4 h-4" /> Add Banner
                    </Button>
                </Link>
            </div>

            <Card className="bg-white/5 border border-white/10 overflow-hidden backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Image</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Title</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Link</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {banners.map((item) => (
                            <TableRow key={item.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                <TableCell>
                                    <div className="relative w-16 h-16 bg-black/20 rounded-sm overflow-hidden">
                                        <Image src={item.imageString} alt="Banner" fill className="object-cover" />
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-white">
                                    {item.title}
                                </TableCell>
                                <TableCell className="text-white/60 text-sm">
                                    {item.link || "/"}
                                </TableCell>
                                <TableCell className="text-right text-white/50 text-sm">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div >
    );
}
