"use client";

export function HistoryPanel() {
    return (
        <div className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-sm flex items-center gap-4 opacity-50">
                <div className="w-12 h-12 bg-white/10 rounded-sm" />
                <div>
                    <div className="h-3 w-24 bg-white/10 rounded mb-2" />
                    <div className="h-2 w-16 bg-white/5 rounded" />
                </div>
            </div>
            <div className="text-center py-8 text-white/20 text-xs uppercase tracking-widest">
                No Generations Yet
            </div>
        </div>
    );
}
