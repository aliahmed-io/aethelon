"use client";

import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ReportsViewProps {
    report: string | null;
    isLoading: boolean;
    onGenerate: (period: "weekly" | "monthly") => void;
    onDownload: () => void;
    onClear: () => void;
}

export function ReportsView({ report, isLoading, onGenerate, onDownload, onClear }: ReportsViewProps) {
    if (!report) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                <FileText className="w-16 h-16 mb-6 text-white/10 stroke-1" />
                <h3 className="text-xl text-white font-light mb-2">Automated Reporting</h3>
                <p className="text-white/40 mb-8 uppercase tracking-widest text-xs max-w-md">
                    Generate comprehensive executive reports summarizing metrics, sentiment, and AI strategic recommendations.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={() => onGenerate("weekly")} disabled={isLoading} className="bg-white text-black hover:bg-zinc-200 rounded-none h-12 px-6 uppercase tracking-widest text-xs font-bold">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Generate Weekly
                    </Button>
                    <Button onClick={() => onGenerate("monthly")} disabled={isLoading} variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-none h-12 px-6 uppercase tracking-widest text-xs">
                        Generate Monthly
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col w-full animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                <div>
                    <h2 className="text-2xl font-light uppercase tracking-tight text-white">Executive Report</h2>
                    <p className="text-white/40 text-xs mt-1">Generated Document</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={onDownload} size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-none h-9 text-xs uppercase tracking-wider">
                        <Download className="w-3 h-3 mr-2" /> Download Markdown
                    </Button>
                    <Button onClick={onClear} size="sm" variant="ghost" className="text-white/40 hover:text-white hover:bg-white/5 h-9">
                        <RefreshCw className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-white/[0.02] border border-white/5 p-12 overflow-y-auto font-mono text-sm leading-relaxed text-zinc-300 markdown-prose shadow-2xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {report}
                </ReactMarkdown>
            </div>
        </div>
    );
}
