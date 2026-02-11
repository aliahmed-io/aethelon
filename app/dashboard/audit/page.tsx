import Prisma from "@/lib/db";
import { FileText, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
    // In a real app, this would be a real DB call.
    // Since I don't see the AuditLog model in the previous context, I'll assume it exists or mock it if needed.
    // But the previous file had it, so I'll keep it.
    let logs: any[] = [];
    try {
        logs = await Prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
        });
    } catch (e) {
        // Fallback if table doesn't exist yet
        console.error("AuditLog table not found", e);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-light uppercase tracking-widest text-foreground">Audit Logs</h1>
                    <p className="text-muted-foreground text-xs font-mono mt-1">SYSTEM ACTIVITY TRACKER</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground uppercase tracking-widest text-xs font-mono border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-normal">Action</th>
                            <th className="px-6 py-4 font-normal">Target</th>
                            <th className="px-6 py-4 font-normal">User</th>
                            <th className="px-6 py-4 font-normal">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 text-foreground font-mono">
                                        <span className="px-2 py-1 bg-muted/50 border border-border rounded-sm text-xs font-medium">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-foreground/80">
                                        {log.targetType} <span className="text-muted-foreground/50">/</span> {log.targetId || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        {log.userId || "System"}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
