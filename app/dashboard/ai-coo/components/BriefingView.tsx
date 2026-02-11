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
                    <h2 className="text-3xl font-light uppercase tracking-tight text-foreground mb-2">Morning Briefing</h2>
                    <p className="text-muted-foreground font-mono text-xs">Generated at {new Date().toLocaleTimeString()}</p>
                </div>
                <Button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    variant="outline"
                    className="border-border hover:bg-muted text-xs uppercase tracking-widest gap-2 bg-transparent text-foreground rounded-none"
                >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh Intelligence
                </Button>
            </div>

            {/* Daily Highlights (Win/Risk) */}
            {highlights && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-card border-border rounded-sm hover:shadow-md transition-all group">
                        <CardContent className="p-6 flex items-start gap-5">
                            <span className="text-xl font-mono text-muted-foreground/50 group-hover:text-foreground transition-colors">01</span>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-2">
                                    Strategic Win
                                </h4>
                                <p className="text-foreground text-sm font-light leading-relaxed mb-1">{highlights.win.description}</p>
                                <div className="text-[10px] text-muted-foreground/70 uppercase tracking-wider flex items-center gap-2 mt-2 group-hover:text-emerald-600 transition-colors">
                                    <TrendingUp className="w-3 h-3" /> Revenue Impact
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border rounded-sm hover:shadow-md transition-all group">
                        <CardContent className="p-6 flex items-start gap-5">
                            <span className="text-xl font-mono text-muted-foreground/50 group-hover:text-foreground transition-colors">02</span>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-2">
                                    Operational Risk
                                </h4>
                                <p className="text-foreground text-sm font-light leading-relaxed mb-1">{highlights.risk.description}</p>
                                <div className="text-[10px] text-muted-foreground/70 uppercase tracking-wider flex items-center gap-2 mt-2 group-hover:text-amber-600 transition-colors">
                                    <AlertCircle className="w-3 h-3" /> Attention Needed
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Executive Summary - Full Width */}
            <Card className="bg-card border-border rounded-sm overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-32 bg-accent/[0.05] blur-[100px] rounded-full pointer-events-none" />
                <CardHeader className="border-b border-border pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                        <Zap className="w-4 h-4 text-muted-foreground" /> Executive Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="prose prose-sm max-w-none text-muted-foreground font-light leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {briefing.summary}
                        </ReactMarkdown>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Critical Alerts */}
                <Card className="bg-card border-border rounded-sm overflow-hidden shadow-sm">
                    <CardHeader className="border-b border-border py-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Critical Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {briefing.alerts.length > 0 ? (
                            <div className="space-y-4">
                                {briefing.alerts.map((alert, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-muted/30 border border-border rounded-sm hover:bg-muted/50 transition-colors">
                                        <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-2 flex-shrink-0" />
                                        <p className="text-sm text-foreground font-light">{alert}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest">System Nominal</p>
                        )}
                    </CardContent>
                </Card>

                {/* Strategic Priorities */}
                <Card className="bg-card border-border rounded-sm overflow-hidden shadow-sm">
                    <CardHeader className="border-b border-border py-4">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Target className="w-4 h-4 text-muted-foreground" /> Strategic Priorities
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ul className="space-y-4">
                            {briefing.topPriorities.map((priority, i) => (
                                <li key={i} className="flex items-start gap-4 group">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full border border-border text-[10px] text-muted-foreground group-hover:border-foreground group-hover:text-foreground transition-all">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm text-foreground transition-colors pt-0.5 font-light">{priority}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations Grid */}
            <div className="pt-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 ml-1">AI Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((rec, i) => (
                        <div key={i} className="bg-card hover:bg-muted/30 border border-border hover:border-foreground/20 p-5 rounded-sm transition-all group cursor-default shadow-sm">
                            <ArrowRight className="w-4 h-4 text-muted-foreground mb-3 group-hover:text-foreground transition-colors" />
                            <p className="text-sm text-muted-foreground group-hover:text-foreground leading-relaxed font-light">{rec}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
