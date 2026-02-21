"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Send, User, BrainCircuit, BarChart3 } from "lucide-react";
import { chatWithBusinessAdvisor } from "@/app/store/actions";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from "recharts";

interface Message {
    role: "user" | "model";
    text: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

interface ChartDataPoint {
    name: string;
    value: number;
    [key: string]: string | number;
}

interface ChartConfig {
    type: "bar" | "line" | "pie" | "area";
    data: ChartDataPoint[];
    xAxis?: string;
    yAxis?: string;
    title?: string;
    description?: string;
}

// Component to render charts based on JSON configuration
const ChartRenderer = ({ config }: { config: ChartConfig }) => {
    if (!config || !config.data || !config.type) return null;

    const { type, data, xAxis, yAxis, title, description } = config;

    // Standardize data keys if not provided
    const xKey = xAxis || "name";
    const yKey = yAxis || "value";

    return (
        <div className="my-4 p-4 border border-border rounded-lg bg-card shadow-sm">
            {title && <h4 className="font-semibold text-center mb-2 text-foreground">{title}</h4>}
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {type === "bar" ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.5} stroke="rgba(0,0,0,0.1)" />
                            <XAxis dataKey={xKey} stroke="rgba(0,0,0,0.5)" fontSize={12} />
                            <YAxis stroke="rgba(0,0,0,0.5)" fontSize={12} />
                            <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white', color: 'black' }} />
                            <Legend />
                            <Bar dataKey={yKey} fill="#C9912B" radius={[4, 4, 0, 0]} name={yKey} />
                        </BarChart>
                    ) : type === "line" ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.5} stroke="rgba(0,0,0,0.1)" />
                            <XAxis dataKey={xKey} stroke="rgba(0,0,0,0.5)" />
                            <YAxis stroke="rgba(0,0,0,0.5)" />
                            <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white', color: 'black' }} />
                            <Legend />
                            <Line type="monotone" dataKey={yKey} stroke="#C9912B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name={yKey} />
                        </LineChart>
                    ) : type === "pie" ? (
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey={yKey}
                                nameKey={xKey}
                            >
                                {data.map((entry: ChartDataPoint, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white', color: 'black' }} />
                            <Legend />
                        </PieChart>
                    ) : type === "area" ? (
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.5} stroke="rgba(0,0,0,0.1)" />
                            <XAxis dataKey={xKey} stroke="rgba(0,0,0,0.5)" />
                            <YAxis stroke="rgba(0,0,0,0.5)" />
                            <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white', color: 'black' }} />
                            <Legend />
                            <Area type="monotone" dataKey={yKey} stroke="#10b981" fill="#10b981" fillOpacity={0.3} name={yKey} />
                        </AreaChart>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">Unsupported chart type</div>
                    )}
                </ResponsiveContainer>
            </div>
            {description && <p className="text-xs text-center text-muted-foreground mt-2">{description}</p>}
        </div>
    );
};

export function AiInsightsWidget() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", text: "I am your AI COO. I have analyzed your latest sales data and database structure. Usage: Ask regarding operational efficiency, revenue trends, or table schemas." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const result = await chatWithBusinessAdvisor(history, userMessage);

            if (result.success && result.response) {
                setMessages(prev => [...prev, { role: "model", text: result.response }]);
            } else {
                setMessages(prev => [...prev, { role: "model", text: result?.message || "Error: Unable to process request." }]);
            }
        } catch (error) {
            console.error("Chat Error", error);
            setMessages(prev => [...prev, { role: "model", text: "System Error." }]);
        } finally {
            setLoading(false);
        }
    };

    // Custom renderer for React Markdown code blocks to capture charts
    const components = {
        code({ inline, className, children, ...props }: React.ComponentProps<"code"> & { inline?: boolean }) {
            const match = /language-(\w+)(:chart)?/.exec(className || '');
            const isChart = match && match[2] === ':chart';

            if (!inline && isChart) {
                try {
                    const config = JSON.parse(String(children).replace(/\n$/, ''));
                    return <ChartRenderer config={config} />;
                } catch {
                    return <div className="p-2 border border-red-200 bg-red-50 text-red-600 text-xs rounded">Invalid Chart JSON</div>;
                }
            }

            return !inline ? (
                <div className="bg-muted rounded-md p-3 overflow-x-auto my-2 text-xs text-foreground font-mono border border-border">
                    <code className={className} {...props}>
                        {children}
                    </code>
                </div>
            ) : (
                <code className={cn("bg-muted text-foreground px-1 py-0.5 rounded text-sm font-mono border border-border", className)} {...props}>
                    {children}
                </code>
            );
        },
        table({ children }: { children: React.ReactNode }) {
            return <div className="overflow-x-auto my-4 border border-border rounded-lg"><table className="w-full text-sm text-left">{children}</table></div>;
        },
        thead({ children }: { children: React.ReactNode }) {
            return <thead className="bg-muted text-foreground uppercase font-semibold">{children}</thead>;
        },
        th({ children }: { children: React.ReactNode }) {
            return <th className="px-4 py-3 whitespace-nowrap">{children}</th>;
        },
        tr({ children }: { children: React.ReactNode }) {
            return <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">{children}</tr>;
        },
        td({ children }: { children: React.ReactNode }) {
            return <td className="px-4 py-3 text-muted-foreground">{children}</td>;
        }
    };

    return (
        <Card className="xl:col-span-3 border-t-4 border-t-accent shadow-md flex flex-col h-[700px] bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/20 border-b border-border">
                <div>
                    <CardTitle className="flex items-center gap-2 text-foreground text-xl">
                        <Sparkles className="w-5 h-5 text-accent" />
                        AI COO Advisor
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Strategic analysis backed by real-time database schema.
                    </CardDescription>
                </div>
                <div className="bg-muted p-2 rounded-full">
                    <BrainCircuit className="w-5 h-5 text-accent" />
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 relative">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
                <div className="h-full flex flex-col relative z-10">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                        {messages.map((m, i) => (
                            <div key={i} className={cn("flex gap-3 max-w-4xl mx-auto w-full group", m.role === "user" ? "justify-end" : "justify-start")}>
                                {m.role === "model" && (
                                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className={cn(
                                    "rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm max-w-[85%]",
                                    m.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-card border border-border text-foreground rounded-tl-sm shadow-md"
                                )}>
                                    {m.role === "model" ? (
                                        <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-headings:text-foreground prose-strong:text-foreground">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={components as any}
                                            >
                                                {m.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        m.text
                                    )}
                                </div>
                                {m.role === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3 max-w-4xl mx-auto w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-md flex items-center gap-2.5">
                                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                                    <span className="text-xs text-muted-foreground font-medium">Analyzing database schema & metrics...</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-card/80 backdrop-blur-sm border-t border-border">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 max-w-4xl mx-auto relative">
                            <div className="relative flex-1">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask for 'Revenue by Month chart' or 'Table of recent orders'..."
                                    className="bg-muted/50 border-input focus-visible:ring-accent pl-4 py-6 pr-12 shadow-sm"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground flex items-center gap-1 pointer-events-none opacity-50">
                                    <BarChart3 className="w-3 h-3" />
                                    <span>Supports Charts</span>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                size="icon"
                                disabled={loading || !input.trim()}
                                className={cn(
                                    "h-12 w-12 rounded-xl bg-accent hover:bg-accent/90 transition-all shadow-md",
                                    loading && "opacity-80"
                                )}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </Button>
                        </form>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
