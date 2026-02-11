"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Star } from "lucide-react";
import { SentimentDeepDive, BenchmarkComparison, VoCCluster } from "@/lib/ai/coo-data";

interface SentimentViewProps {
    sentimentData: SentimentDeepDive | null;
    isLoading: boolean;
    onLoad: () => void;
    benchmarks: BenchmarkComparison[] | null;
    vocClusters: VoCCluster[] | null;
}

export function SentimentView({ sentimentData, isLoading, onLoad, benchmarks, vocClusters }: SentimentViewProps) {
    if (!sentimentData) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                <MessageSquare className="w-16 h-16 mb-6 text-muted-foreground/20 stroke-1" />
                <h3 className="text-xl text-foreground font-light mb-2">Sentiment Intelligence</h3>
                <p className="text-muted-foreground mb-8 uppercase tracking-widest text-xs max-w-md">
                    Analyze customer feedback trends, keyword clusters, and satisfaction drivers.
                </p>
                <Button onClick={onLoad} disabled={isLoading} className="bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 px-8 uppercase tracking-widest text-xs font-bold transition-all">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : null}
                    Run Sentiment Analysis
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-12 w-full animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h2 className="text-2xl font-light uppercase tracking-tight text-foreground">Sentiment Deep Dive</h2>
                    <p className="text-muted-foreground text-xs mt-1">Feedback Analysis & Context</p>
                </div>
                <Button onClick={onLoad} disabled={isLoading} variant="outline" className="border-border hover:bg-muted text-xs uppercase tracking-widest bg-transparent text-foreground rounded-none">
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : "Refresh"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border border-border rounded-sm shadow-sm">
                    <CardContent className="p-6 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Global Rating</p>
                        <p className="text-5xl font-light text-foreground">{sentimentData.averageRating}<span className="text-lg text-muted-foreground">/5</span></p>
                    </CardContent>
                </Card>
                <Card className="bg-card border border-border rounded-sm shadow-sm">
                    <CardContent className="p-6 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Total Volume</p>
                        <p className="text-5xl font-light text-foreground">{sentimentData.totalReviews}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border border-border rounded-sm shadow-sm">
                    <CardContent className="p-6 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Momentum</p>
                        <p className="text-3xl font-light text-foreground capitalize flex items-center justify-center gap-2">
                            {sentimentData.recentTrend === "improving" ? (
                                <><span className="text-emerald-600 text-xl">↑</span> Positive</>
                            ) : sentimentData.recentTrend === "declining" ? (
                                <><span className="text-red-600 text-xl">↓</span> Negative</>
                            ) : (
                                "Stable"
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Benchmarks Section */}
            {benchmarks && (
                <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Market Benchmarking</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {benchmarks.map((bench) => (
                            <div key={bench.metric} className="bg-card border border-border p-6 rounded-sm shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-sm font-medium text-foreground">{bench.metric}</h4>
                                    <div className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border ${bench.status === "leading" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                        bench.status === "lagging" ? "bg-red-50 text-red-600 border-red-200" :
                                            "bg-muted text-muted-foreground border-border"
                                        }`}>
                                        {bench.status}
                                    </div>
                                </div>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-3xl font-light text-foreground">{bench.ourValue}</span>
                                    <span className="text-xs text-muted-foreground mb-1.5">vs {bench.industryValue} (Industry)</span>
                                </div>
                                <div className="w-full h-0.5 bg-muted overflow-hidden mt-4">
                                    <div
                                        className={`h-full ${bench.status === 'leading' ? 'bg-emerald-500' : 'bg-foreground/20'}`}
                                        style={{ width: `${Math.min(100, (bench.ourValue / (bench.industryValue * 1.5)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Voice of Customer Clusters */}
            {vocClusters && (
                <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Voice of Customer Clusters</h3>
                    <div className="flex flex-wrap gap-4 p-8 bg-card border border-border rounded-sm justify-center items-center min-h-[200px] shadow-sm">
                        {vocClusters.length > 0 ? vocClusters.map((cluster, i) => (
                            <div
                                key={cluster.topic}
                                className={`rounded-full border flex flex-col items-center justify-center text-center transition-all hover:scale-105 cursor-default ${cluster.sentiment >= 4 ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                                    cluster.sentiment <= 2 ? "bg-red-50 border-red-200 text-red-700" :
                                        "bg-muted border-border text-foreground"
                                    }`}
                                style={{
                                    width: `${Math.max(100, Math.min(180, cluster.volume * 20))}px`,
                                    height: `${Math.max(100, Math.min(180, cluster.volume * 20))}px`,
                                }}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wide px-2">{cluster.topic}</span>
                                <span className="text-[9px] opacity-80 mt-1">{cluster.volume} Mentions</span>
                            </div>
                        )) : (
                            <p className="text-muted-foreground text-sm italic">Not enough data to cluster topics.</p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Positive Drivers</h4>
                    <div className="flex flex-wrap gap-2">
                        {sentimentData.positiveKeywords.slice(0, 8).map((kw) => (
                            <span key={kw.word} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-100 uppercase tracking-wider">
                                {kw.word} <span className="text-emerald-500 ml-1">{kw.count}</span>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Negative Drivers</h4>
                    <div className="flex flex-wrap gap-2">
                        {sentimentData.negativeKeywords.slice(0, 8).map((kw) => (
                            <span key={kw.word} className="px-3 py-1 bg-red-50 text-red-700 text-[10px] border border-red-100 uppercase tracking-wider">
                                {kw.word} <span className="text-red-400 ml-1">{kw.count}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {sentimentData.highlightReviews.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Key Verbatims</h4>
                    <div className="grid grid-cols-1 gap-4">
                        {sentimentData.highlightReviews.map((r, i) => (
                            <div key={i} className="bg-card p-6 border border-border hover:border-foreground/20 transition-colors rounded-sm group shadow-sm">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, starI) => (
                                            <Star
                                                key={starI}
                                                className={`w-3 h-3 ${starI < r.rating ? "fill-accent text-accent" : "fill-muted text-muted"}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{r.date}</span>
                                </div>
                                <p className="text-sm text-foreground font-light leading-relaxed italic">
                                    &quot;{r.content || "No comment provided."}&quot;
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
