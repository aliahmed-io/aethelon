"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    TrendingUp,
    Package,
    Star,
    Brain
} from "lucide-react";
import {
    sendMessage,
    generateMorningBriefing,
    generateRecommendations,
    generateReport,
    type MorningBriefing
} from "@/lib/ai/coo-service";
import {
    getRevenueForecast,
    getDemandForecast,
    getSentimentDeepDive,
    getDailyHighlights,
    getCompetitorBenchmarks,
    getVoCClusters,
    type RevenueForecast,
    type DemandForecast,
    type SentimentDeepDive,
    type DailyHighlights,
    type BenchmarkComparison,
    type VoCCluster
} from "@/lib/ai/coo-data";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic Imports for Code Splitting
const Sidebar = dynamic(() => import("./components/Sidebar").then(mod => mod.Sidebar));
const MobileSidebar = dynamic(() => import("./components/Sidebar").then(mod => mod.MobileSidebar));
const BriefingView = dynamic(() => import("./components/BriefingView").then(mod => mod.BriefingView), {
    loading: () => <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>
});
const ConsoleView = dynamic(() => import("./components/ConsoleView").then(mod => mod.ConsoleView));
const ForecastView = dynamic(() => import("./components/ForecastView").then(mod => mod.ForecastView));
const SentimentView = dynamic(() => import("./components/SentimentView").then(mod => mod.SentimentView));
const ReportsView = dynamic(() => import("./components/ReportsView").then(mod => mod.ReportsView));

// ============================================================
// TYPES
// ============================================================

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

interface COOClientProps {
    initialBriefing: MorningBriefing;
    initialRecommendations: string[];
    businessContext: any;
}

// ============================================================
// COMPONENT
// ============================================================

export function COOClient({
    initialBriefing,
    initialRecommendations,
    businessContext,
}: COOClientProps) {
    // Global Tab State
    const [activeTab, setActiveTab] = useState("briefing");

    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Briefing State
    const [briefing, setBriefing] = useState(initialBriefing);
    const [recommendations, setRecommendations] = useState(initialRecommendations);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [highlights, setHighlights] = useState<DailyHighlights | null>(null);

    // Forecast State
    const [forecast, setForecast] = useState<RevenueForecast | null>(null);
    const [demandForecast, setDemandForecast] = useState<DemandForecast[] | null>(null);
    const [isLoadingForecast, setIsLoadingForecast] = useState(false);

    // Sentiment State
    const [sentimentData, setSentimentData] = useState<SentimentDeepDive | null>(null);
    const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);
    const [benchmarks, setBenchmarks] = useState<BenchmarkComparison[] | null>(null);
    const [vocClusters, setVocClusters] = useState<VoCCluster[] | null>(null);

    // Report State
    const [report, setReport] = useState<string | null>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    // --- Effects ---

    useEffect(() => {
        getDailyHighlights().then(setHighlights);
    }, []);

    // --- Handlers ---

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: "user",
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await sendMessage(userMessage.content);
            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.content,
                timestamp: response.timestamp,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            const errorMessage: ChatMessage = {
                role: "assistant",
                content: "I encountered an error processing your request. Please try again.",
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefreshBriefing = async () => {
        setIsRefreshing(true);
        try {
            const [newBriefing, newRecs, newHighlights] = await Promise.all([
                generateMorningBriefing(),
                generateRecommendations(),
                getDailyHighlights()
            ]);
            setBriefing(newBriefing);
            setRecommendations(newRecs);
            setHighlights(newHighlights);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleLoadForecast = async () => {
        setIsLoadingForecast(true);
        try {
            const [revForecast, demForecast] = await Promise.all([
                getRevenueForecast(30),
                getDemandForecast(30),
            ]);
            setForecast(revForecast);
            setDemandForecast(demForecast);
        } finally {
            setIsLoadingForecast(false);
        }
    };

    const handleLoadSentiment = async () => {
        setIsLoadingSentiment(true);
        try {
            const [data, bench, voc] = await Promise.all([
                getSentimentDeepDive(),
                getCompetitorBenchmarks(),
                getVoCClusters()
            ]);
            setSentimentData(data);
            setBenchmarks(bench);
            setVocClusters(voc);
        } finally {
            setIsLoadingSentiment(false);
        }
    };

    const handleGenerateReport = async (period: "weekly" | "monthly") => {
        setIsLoadingReport(true);
        try {
            const reportContent = await generateReport(period);
            setReport(reportContent);
        } finally {
            setIsLoadingReport(false);
        }
    };

    const handleDownloadReport = () => {
        if (!report) return;
        const blob = new Blob([report], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `aethelon-report-${new Date().toISOString().split("T")[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-background text-foreground font-light overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} className="hidden md:flex" />

            {/* Mobile Header */}
            <div className="md:hidden h-16 border-b border-border flex items-center px-4 bg-background/95 backdrop-blur-xl flex-none z-50">
                <MobileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
                <span className="ml-4 text-sm font-bold uppercase tracking-widest text-foreground">Aethelon COO</span>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto flex flex-col bg-muted/20 backdrop-blur-sm">

                {/* Global KPI Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="md:col-span-1 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-accent/10 rounded-full">
                                <Brain className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold uppercase tracking-tight text-foreground leading-none">Aethelon AI</h1>
                                <p className="text-muted-foreground text-[10px] tracking-wide uppercase">Operational Intelligence</p>
                            </div>
                        </div>
                    </div>

                    <Card className="bg-card border border-border rounded-sm hover:shadow-sm transition-all group shadow-sm">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Revenue (24h)</span>
                                <TrendingUp className="w-3 h-3 text-muted-foreground/50" />
                            </div>
                            <p className="text-2xl font-light text-foreground tracking-tight">
                                ${businessContext.snapshot.revenue.today.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border rounded-sm hover:shadow-sm transition-all group shadow-sm">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Orders (Week)</span>
                                <Package className="w-3 h-3 text-muted-foreground/50" />
                            </div>
                            <p className="text-2xl font-light text-foreground tracking-tight">
                                {businessContext.snapshot.orders.thisWeek}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border rounded-sm hover:shadow-sm transition-all group shadow-sm">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Sentiment</span>
                                <Star className="w-3 h-3 text-muted-foreground/50" />
                            </div>
                            <p className="text-2xl font-light text-foreground tracking-tight">
                                {businessContext.sentiment.averageRating}/5
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Area - Switches based on Active Tab */}
                <div className="flex-1 relative">
                    {activeTab === "briefing" && (
                        <BriefingView
                            briefing={briefing}
                            recommendations={recommendations}
                            onRefresh={handleRefreshBriefing}
                            isRefreshing={isRefreshing}
                            // @ts-ignore - Prop expansion pending
                            highlights={highlights}
                        />
                    )}

                    {activeTab === "chat" && (
                        <ConsoleView
                            messages={messages}
                            input={input}
                            setInput={setInput}
                            isLoading={isLoading}
                            onSend={handleSend}
                        />
                    )}

                    {activeTab === "forecast" && (
                        <ForecastView
                            forecast={forecast}
                            demandForecast={demandForecast}
                            isLoading={isLoadingForecast}
                            onLoad={handleLoadForecast}
                        />
                    )}

                    {activeTab === "sentiment" && (
                        <SentimentView
                            sentimentData={sentimentData}
                            isLoading={isLoadingSentiment}
                            onLoad={handleLoadSentiment}
                            // @ts-ignore - Prop expansion pending
                            benchmarks={benchmarks}
                            // @ts-ignore - Prop expansion pending
                            vocClusters={vocClusters}
                        />
                    )}

                    {activeTab === "reports" && (
                        <ReportsView
                            report={report}
                            isLoading={isLoadingReport}
                            onGenerate={handleGenerateReport}
                            onDownload={handleDownloadReport}
                            onClear={() => setReport(null)}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
