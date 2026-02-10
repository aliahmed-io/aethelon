"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Target, ArrowRight, Zap, RefreshCw, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MorningBriefing } from "@/lib/ai/coo-service";
import { DailyHighlights } from "@/lib/ai/coo-data";
import { Button } from "@/components/ui/button";

interface BriefingViewProps {
    briefing: MorningBriefing;
    recommendations: string[];
    onRefresh: () => void;
    isRefreshing: boolean;
    highlights: DailyHighlights | null;
}

export function BriefingView({ briefing, recommendations, onRefresh, isRefreshing, highlights }: BriefingViewProps) {
    return (
        <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-light uppercase tracking-tight text-white mb-2">Morning Briefing</h2>
                    <p className="text-white/40 font-mono text-xs">Generated at {new Date().toLocaleTimeString()}</p>
                </div>
                <Button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    variant="outline"
                    className="border-white/20 hover:bg-white/10 text-xs uppercase tracking-widest gap-2 bg-transparent text-white rounded-none"
                >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh Intelligence
                </Button>
            </div>

            {/* Daily Highlights (Win/Risk) */}
            {highlights && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-[#050505] border-white/10 rounded-sm hover:border-white/20 transition-colors group">
                        <CardContent className="p-6 flex items-start gap-5">
                            <span className="text-xl font-mono text-white/20 group-hover:text-white/60 transition-colors">01</span>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 flex items-center gap-2">
                                    Strategic Win
                                </h4>
                                <p className="text-white text-sm font-light leading-relaxed mb-1">{highlights.win.description}</p>
                                <div className="text-[10px] text-white/30 uppercase tracking-wider flex items-center gap-2 mt-2 group-hover:text-emerald-400/80 transition-colors">
                                    <TrendingUp className="w-3 h-3" /> Revenue Impact
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#050505] border-white/10 rounded-sm hover:border-white/20 transition-colors group">
                        <CardContent className="p-6 flex items-start gap-5">
                            <span className="text-xl font-mono text-white/20 group-hover:text-white/60 transition-colors">02</span>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 flex items-center gap-2">
                                    Operational Risk
                                </h4>
                                <p className="text-white text-sm font-light leading-relaxed mb-1">{highlights.risk.description}</p>
                                <div className="text-[10px] text-white/30 uppercase tracking-wider flex items-center gap-2 mt-2 group-hover:text-amber-400/80 transition-colors">
                                    <AlertCircle className="w-3 h-3" /> Attention Needed
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Executive Summary - Full Width */}
            <Card className="bg-[#050505] border-white/10 rounded-sm overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />
                <CardHeader className="border-b border-white/5 pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-white/60" /> Executive Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="prose prose-invert max-w-none text-zinc-400 font-light leading-relaxed text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {briefing.summary}
                        </ReactMarkdown>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Critical Alerts */}
                <Card className="bg-[#050505] border-white/10 rounded-sm overflow-hidden">
                    <CardHeader className="border-b border-white/5 py-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Critical Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {briefing.alerts.length > 0 ? (
                            <div className="space-y-4">
                                {briefing.alerts.map((alert, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-sm hover:border-white/10 transition-colors">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0" />
                                        <p className="text-sm text-zinc-300 font-light">{alert}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-white/20 text-sm font-mono uppercase tracking-widest">System Nominal</p>
                        )}
                    </CardContent>
                </Card>

                {/* Strategic Priorities */}
                <Card className="bg-[#050505] border-white/10 rounded-sm overflow-hidden">
                    <CardHeader className="border-b border-white/5 py-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
                            <Target className="w-4 h-4 text-white/60" /> Strategic Priorities
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ul className="space-y-4">
                            {briefing.topPriorities.map((priority, i) => (
                                <li key={i} className="flex items-start gap-4 group">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full border border-white/10 text-[10px] text-white/40 group-hover:border-white/40 group-hover:text-white transition-all">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors pt-0.5 font-light">{priority}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations Grid */}
            <div className="pt-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4 ml-1">AI Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((rec, i) => (
                        <div key={i} className="bg-[#050505] hover:bg-white/[0.03] border border-white/10 hover:border-white/30 p-5 rounded-sm transition-all group cursor-default">
                            <ArrowRight className="w-4 h-4 text-white/20 mb-3 group-hover:text-white transition-colors" />
                            <p className="text-sm text-zinc-400 group-hover:text-zinc-200 leading-relaxed font-light">{rec}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
