import { checkIntegrations } from "@/lib/health";
import { Database, Server, Zap } from "lucide-react";
import clsx from "clsx";

export default async function SystemHealthPage() {
    const health = await checkIntegrations();

    const getIcon = (service: string) => {
        switch (service.toLowerCase()) {
            case "database": return <Database className="w-5 h-5" />;
            case "stripe": return <Zap className="w-5 h-5" />;
            default: return <Server className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-light uppercase tracking-widest text-white">System Health</h1>
                    <p className="text-white/40 text-xs font-mono mt-1">INFRASTRUCTURE STATUS</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Operational</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {health.map((item, idx) => (
                    <div
                        key={idx}
                        className="bg-[#0A0A0C] border border-white/10 p-6 rounded-sm hover:border-white/20 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/5 rounded-sm text-white/70 group-hover:text-white transition-colors">
                                {getIcon(item.service)}
                            </div>
                            <div className={clsx(
                                "px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border",
                                item.status === 'healthy' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                    item.status === 'misconfigured' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                        "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                                {item.status}
                            </div>
                        </div>

                        <h3 className="text-lg font-medium text-white mb-1">{item.service}</h3>
                        <p className="text-sm text-white/40 font-light">
                            {item.message || "Service operating normally."}
                        </p>
                    </div>
                ))}

                {/* Environment Info Card */}
                <div className="bg-[#0A0A0C] border border-white/10 p-6 rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Environment</h3>
                    <div className="space-y-2 font-mono text-xs text-white/70">
                        <div className="flex justify-between">
                            <span>NODE_ENV</span>
                            <span className="text-white">{process.env.NODE_ENV}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>REGION</span>
                            <span className="text-white">US-EAST-1</span>
                        </div>
                        <div className="flex justify-between">
                            <span>VERCEL_ENV</span>
                            <span className="text-white">{process.env.VERCEL_ENV || "development"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
