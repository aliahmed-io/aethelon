import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Link as LinkIcon } from "lucide-react";
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

async function getCampaigns() {
    return await Prisma.campaign.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });
}

export default async function CampaignsPage() {
    const campaigns = await getCampaigns();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-light tracking-tight uppercase">Campaigns</h2>
                <Link href="/dashboard/campaigns/create">
                    <Button className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest gap-2">
                        <PlusCircle className="w-4 h-4" /> Create Campaign
                    </Button>
                </Link>
            </div>

            <Card className="bg-white/5 border border-white/10 overflow-hidden backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Image</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Title</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Products</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs">Link</TableHead>
                            <TableHead className="text-white/50 uppercase tracking-widest text-xs text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-white/40 h-24">
                                    No campaigns found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            campaigns.map((item) => (
                                <TableRow key={item.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                    <TableCell>
                                        <div className="relative w-16 h-16 bg-black/20 rounded-sm overflow-hidden">
                                            {item.heroImage ? (
                                                <Image src={item.heroImage} alt="Campaign" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-white/10 flex items-center justify-center text-xs text-white/30">No Img</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">
                                        {item.title}
                                        <div className="text-xs text-white/40 font-mono mt-1">/{item.slug}</div>
                                    </TableCell>
                                    <TableCell className="text-white/60 text-sm">
                                        {item._count.products} Products
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/campaigns/${item.slug}`} target="_blank" className="text-amber-400 hover:underline flex items-center gap-1 text-xs uppercase tracking-wider">
                                            View <LinkIcon className="w-3 h-3" />
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right text-white/50 text-sm">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
