import Prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Printer, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { approveReturn, rejectReturn } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReturnsDashboard() {
    await requireAdmin();

    const requests = await Prisma.returnRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: true,
            order: {
                include: { orderItems: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Returns Management</h1>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No return requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/dashboard/orders/${req.orderId}`} className="hover:underline text-blue-600">
                                            {req.orderId.slice(0, 8)}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div>{req.user.firstName} {req.user.lastName}</div>
                                        <div className="text-xs text-muted-foreground">{req.user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{req.reason}</Badge>
                                        {req.adminNotes && <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">{req.adminNotes}</div>}
                                    </TableCell>
                                    <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            req.status === "PENDING" ? "secondary" :
                                                req.status === "APPROVED" ? "success" :
                                                    req.status === "REJECTED" ? "destructive" : "outline"
                                        }>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === "PENDING" && (
                                            <div className="flex justify-end gap-2">
                                                <form action={approveReturn}>
                                                    <input type="hidden" name="requestId" value={req.id} />
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600">
                                                        <Check className="h-4 w-4" />
                                                        <span className="sr-only">Approve</span>
                                                    </Button>
                                                </form>
                                                <form action={rejectReturn}>
                                                    <input type="hidden" name="requestId" value={req.id} />
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600">
                                                        <X className="h-4 w-4" />
                                                        <span className="sr-only">Reject</span>
                                                    </Button>
                                                </form>
                                            </div>
                                        )}
                                        {req.status === "APPROVED" && req.returnLabelUrl && (
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={req.returnLabelUrl} target="_blank" rel="noopener noreferrer">
                                                    <Printer className="mr-2 h-3 w-3" />
                                                    Label
                                                </a>
                                            </Button>
                                        )}
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
