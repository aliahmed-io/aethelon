import Prisma from "@/lib/db";
import { FileText, User } from "lucide-react";

export default async function AuditLogsPage() {
    const logs = await Prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-light uppercase tracking-widest text-white">Audit Logs</h1>
                    <p className="text-white/40 text-xs font-mono mt-1">SYSTEM ACTIVITY TRACKER</p>
                </div>
            </div>

            <div className="bg-[#0A0A0C] border border-white/10 rounded-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-xs font-mono">
                        <tr>
                            <th className="px-6 py-4 font-normal">Action</th>
                            <th className="px-6 py-4 font-normal">Target</th>
                            <th className="px-6 py-4 font-normal">User</th>
                            <th className="px-6 py-4 font-normal">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-white/20">
                                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-white font-mono">
                                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm text-xs">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/70">
                                        {log.targetType} <span className="text-white/30">/</span> {log.targetId || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-white/50 flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        {log.userId || "System"}
                                    </td>
                                    <td className="px-6 py-4 text-white/40 font-mono text-xs">
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
