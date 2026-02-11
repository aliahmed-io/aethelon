"use client";

import { Activity, Database, Server, Wifi } from "lucide-react";

export function SystemHealthWidget() {
    return (
        <div className="flex items-center gap-6 bg-card border border-border rounded-sm py-2 px-4 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">System Operational</span>
            </div>

            <div className="h-4 w-px bg-border hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5" title="Database Connected">
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span className="font-mono">DB: 24ms</span>
                </div>
                <div className="flex items-center gap-1.5" title="API Latency">
                    <Server className="w-3 h-3 text-emerald-600" />
                    <span className="font-mono">API: 12ms</span>
                </div>
                <div className="flex items-center gap-1.5" title="Cache Status">
                    <Activity className="w-3 h-3 text-emerald-600" />
                    <span className="font-mono">Cache: HIT</span>
                </div>
            </div>
        </div>
    );
}
