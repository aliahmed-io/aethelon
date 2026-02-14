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
import { Mail, CheckCircle, Trash2 } from "lucide-react";
import { updateContactStatus, deleteContact } from "@/app/store/dashboard/contact/actions";

export const dynamic = "force-dynamic";

export default async function ContactInbox() {
    await requireAdmin();

    const messages = await Prisma.contact.findMany({
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>From</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {messages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No messages found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            messages.map((msg) => (
                                <TableRow key={msg.id} className={!msg.isRead ? "bg-muted/50 font-medium" : ""}>
                                    <TableCell>
                                        <div>{msg.name}</div>
                                        <div className="text-xs text-muted-foreground">{msg.email}</div>
                                    </TableCell>
                                    <TableCell>{msg.subject}</TableCell>
                                    <TableCell className="max-w-md truncate">{msg.message}</TableCell>
                                    <TableCell>{new Date(msg.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            msg.status === "PENDING" ? "secondary" :
                                                msg.status === "COMPLETED" ? "success" : "outline"
                                        }>
                                            {msg.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {msg.status !== "COMPLETED" && (
                                                <form action={updateContactStatus}>
                                                    <input type="hidden" name="id" value={msg.id} />
                                                    <input type="hidden" name="status" value="COMPLETED" />
                                                    <Button size="icon" variant="ghost" title="Mark Completed">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                </form>
                                            )}
                                            <form action={deleteContact}>
                                                <input type="hidden" name="id" value={msg.id} />
                                                <Button size="icon" variant="ghost" title="Delete">
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </form>
                                        </div>
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
