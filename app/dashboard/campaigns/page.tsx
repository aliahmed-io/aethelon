import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Link as LinkIcon, Pencil } from "lucide-react";
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

type CampaignRow = {
    id: string;
    title: string;
    slug: string;
    heroImage: string | null;
    createdAt: Date;
    _count: { products: number };
};

export default async function CampaignsPage() {
    const campaigns = await getCampaigns();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">Campaigns</h2>
                <Link href="/dashboard/campaigns/create">
                    <Button className="font-bold uppercase tracking-widest gap-2 bg-foreground text-background hover:bg-foreground/90">
                        <PlusCircle className="w-4 h-4" /> Create Campaign
                    </Button>
                </Link>
            </div>

            <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Image</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Title</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Products</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs">Link</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">Date</TableHead>
                            <TableHead className="text-muted-foreground uppercase tracking-widest text-xs text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                    No campaigns found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            (campaigns as unknown as CampaignRow[]).map((item) => (
                                <TableRow key={item.id} className="border-border hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="relative w-16 h-16 bg-muted rounded-sm overflow-hidden border border-border">
                                            {item.heroImage ? (
                                                <Image src={item.heroImage} alt="Campaign" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">
                                        {item.title}
                                        <div className="text-xs text-muted-foreground font-mono mt-1">/{item.slug}</div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {item._count.products} Products
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/campaigns/${item.slug}`} target="_blank" className="text-accent hover:underline flex items-center gap-1 text-xs uppercase tracking-wider">
                                            View <LinkIcon className="w-3 h-3" />
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-sm">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/dashboard/campaigns/${item.id}`} className="text-amber-400 hover:underline flex items-center justify-end gap-1 text-xs uppercase tracking-wider">
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
