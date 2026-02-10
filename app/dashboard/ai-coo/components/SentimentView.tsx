"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Star, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
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
                <MessageSquare className="w-16 h-16 mb-6 text-white/10 stroke-1" />
                <h3 className="text-xl text-white font-light mb-2">Sentiment Intelligence</h3>
                <p className="text-white/40 mb-8 uppercase tracking-widest text-xs max-w-md">
                    Analyze customer feedback trends, keyword clusters, and satisfaction drivers.
                </p>
                <Button onClick={onLoad} disabled={isLoading} className="bg-white text-black hover:bg-zinc-200 rounded-none h-12 px-8 uppercase tracking-widest text-xs font-bold transition-all">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : null}
                    Run Sentiment Analysis
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-12 w-full animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-2xl font-light uppercase tracking-tight text-white">Sentiment Deep Dive</h2>
                    <p className="text-white/40 text-xs mt-1">Feedback Analysis & Context</p>
                </div>
                <Button onClick={onLoad} disabled={isLoading} variant="outline" className="border-white/20 hover:bg-white/10 text-xs uppercase tracking-widest bg-transparent text-white rounded-none">
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : "Refresh"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#050505] border border-white/10 rounded-sm">
                    <CardContent className="p-6 text-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Global Rating</p>
                        <p className="text-5xl font-light text-white">{sentimentData.averageRating}<span className="text-lg text-white/40">/5</span></p>
                    </CardContent>
                </Card>
                <Card className="bg-[#050505] border border-white/10 rounded-sm">
                    <CardContent className="p-6 text-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Total Volume</p>
                        <p className="text-5xl font-light text-white">{sentimentData.totalReviews}</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#050505] border border-white/10 rounded-sm">
                    <CardContent className="p-6 text-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Momentum</p>
                        <p className="text-3xl font-light text-white capitalize flex items-center justify-center gap-2">
                            {sentimentData.recentTrend === "improving" ? (
                                <><span className="text-white text-xl">↑</span> Positive</>
                            ) : sentimentData.recentTrend === "declining" ? (
                                <><span className="text-white/40 text-xl">↓</span> Negative</>
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
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Market Benchmarking</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {benchmarks.map((bench) => (
                            <div key={bench.metric} className="bg-[#050505] border border-white/10 p-6 rounded-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-sm font-medium text-white">{bench.metric}</h4>
                                    <div className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border ${bench.status === "leading" ? "bg-white text-black border-white" :
                                            bench.status === "lagging" ? "bg-transparent text-white/40 border-white/10" :
                                                "bg-transparent border-white/10 text-white/40"
                                        }`}>
                                        {bench.status}
                                    </div>
                                </div>
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-3xl font-light text-white">{bench.ourValue}</span>
                                    <span className="text-xs text-white/40 mb-1.5">vs {bench.industryValue} (Industry)</span>
                                </div>
                                <div className="w-full h-0.5 bg-white/10 overflow-hidden mt-4">
                                    <div
                                        className={`h-full ${bench.status === 'leading' ? 'bg-white' : 'bg-white/20'}`}
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
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Voice of Customer Clusters</h3>
                    <div className="flex flex-wrap gap-4 p-8 bg-[#050505] border border-white/10 rounded-sm justify-center items-center min-h-[200px]">
                        {vocClusters.length > 0 ? vocClusters.map((cluster, i) => (
                            <div
                                key={cluster.topic}
                                className={`rounded-full border flex flex-col items-center justify-center text-center transition-all hover:scale-105 cursor-default ${cluster.sentiment >= 4 ? "bg-white/[0.05] border-white/20 text-white" :
                                        cluster.sentiment <= 2 ? "bg-transparent border-white/10 text-white/40" :
                                            "bg-transparent border-white/5 text-white/60"
                                    }`}
                                style={{
                                    width: `${Math.max(100, Math.min(180, cluster.volume * 20))}px`,
                                    height: `${Math.max(100, Math.min(180, cluster.volume * 20))}px`,
                                }}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wide px-2">{cluster.topic}</span>
                                <span className="text-[9px] opacity-60 mt-1">{cluster.volume} Mentions</span>
                            </div>
                        )) : (
                            <p className="text-white/20 text-sm italic">Not enough data to cluster topics.</p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest text-white/60 border-b border-white/10 pb-2">Positive Drivers</h4>
                    <div className="flex flex-wrap gap-2">
                        {sentimentData.positiveKeywords.slice(0, 8).map((kw) => (
                            <span key={kw.word} className="px-3 py-1 bg-white/[0.05] text-white text-[10px] border border-white/10 uppercase tracking-wider">
                                {kw.word} <span className="text-white/40 ml-1">{kw.count}</span>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">Negative Drivers</h4>
                    <div className="flex flex-wrap gap-2">
                        {sentimentData.negativeKeywords.slice(0, 8).map((kw) => (
                            <span key={kw.word} className="px-3 py-1 bg-transparent text-white/40 text-[10px] border border-white/5 uppercase tracking-wider line-through decoration-white/20">
                                {kw.word} <span className="text-white/20 ml-1">{kw.count}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {sentimentData.highlightReviews.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-widest text-white/40 border-b border-white/10 pb-2">Key Verbatims</h4>
                    <div className="grid grid-cols-1 gap-4">
                        {sentimentData.highlightReviews.map((r, i) => (
                            <div key={i} className="bg-[#050505] p-6 border border-white/5 hover:border-white/20 transition-colors rounded-sm group">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, starI) => (
                                            <Star
                                                key={starI}
                                                className={`w-3 h-3 ${starI < r.rating ? "fill-white text-white" : "fill-white/10 text-white/10"}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-colors">{r.date}</span>
                                </div>
                                <p className="text-sm text-zinc-400 font-light leading-relaxed italic group-hover:text-zinc-200 transition-colors">
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
