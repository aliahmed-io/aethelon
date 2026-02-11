import { checkIntegrations } from "@/lib/health";
import { Database, Server, Zap } from "lucide-react";
import clsx from "clsx";

export const dynamic = "force-dynamic";

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
                    <h1 className="text-2xl font-light uppercase tracking-widest text-foreground">System Health</h1>
                    <p className="text-muted-foreground text-xs font-mono mt-1">INFRASTRUCTURE STATUS</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Operational</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {health.map((item, idx) => (
                    <div
                        key={idx}
                        className="bg-card border border-border p-6 rounded-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-muted rounded-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                {getIcon(item.service)}
                            </div>
                            <div className={clsx(
                                "px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border",
                                item.status === 'healthy' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                    item.status === 'misconfigured' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                        "bg-red-100 text-red-700 border-red-200"
                            )}>
                                {item.status}
                            </div>
                        </div>

                        <h3 className="text-lg font-medium text-foreground mb-1">{item.service}</h3>
                        <p className="text-sm text-muted-foreground font-light">
                            {item.message || "Service operating normally."}
                        </p>
                    </div>
                ))}

                {/* Environment Info Card */}
                <div className="bg-card border border-border p-6 rounded-sm relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Environment</h3>
                    <div className="space-y-2 font-mono text-xs text-muted-foreground">
                        <div className="flex justify-between border-b border-border pb-1">
                            <span>NODE_ENV</span>
                            <span className="text-foreground">{process.env.NODE_ENV}</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-1">
                            <span>REGION</span>
                            <span className="text-foreground">US-EAST-1</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span>VERCEL_ENV</span>
                            <span className="text-foreground">{process.env.VERCEL_ENV || "development"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
