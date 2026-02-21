"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, Play, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { TestResult } from "@/lib/interfaces";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { testAuth, testDatabase, testGemini, testMeshy, testReplicate, testResend, testShippo, testStripe, testUploadThing } from "@/app/store/dashboard/tests/actions";
import { cn } from "@/lib/utils";

const TESTS = [
    { id: "db", name: "Database", action: testDatabase },
    { id: "auth", name: "Auth (Kinde)", action: testAuth },
    { id: "stripe", name: "Stripe", action: testStripe },
    { id: "resend", name: "Resend Email", action: testResend },
    { id: "gemini", name: "Gemini AI", action: testGemini },
    { id: "meshy", name: "Meshy (3D)", action: testMeshy },
    { id: "replicate", name: "Replicate (AI)", action: testReplicate },
    { id: "shippo", name: "Shippo", action: testShippo },
    { id: "uploadthing", name: "UploadThing", action: testUploadThing },
];

export function DetailedIntegrationHealthWidget() {
    const [results, setResults] = useState<Record<string, TestResult>>({});
    const [running, setRunning] = useState<Record<string, boolean>>({});
    const [isRunningAll, setIsRunningAll] = useState(false);

    const runTest = async (id: string, action: () => Promise<TestResult>) => {
        setRunning(prev => ({ ...prev, [id]: true }));
        try {
            const res = await action();
            setResults(prev => ({ ...prev, [id]: res }));
            if (res.status === "failure") {
                toast.error(`${res.name}: ${res.message}`);
            }
        } catch {
            toast.error("Test failed unexpectedly");
        } finally {
            setRunning(prev => ({ ...prev, [id]: false }));
        }
    };

    const runAll = async () => {
        setIsRunningAll(true);
        await Promise.all(TESTS.map(test => runTest(test.id, test.action)));
        setIsRunningAll(false);
        toast.success("System check completed");
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-medium">System Health & Diagnostics</CardTitle>
                    <CardDescription>Real-time checks and metric analysis for integrations.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={runAll} disabled={isRunningAll}>
                    {isRunningAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    Run All Checks
                </Button>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {TESTS.map((test) => {
                        const result = results[test.id];
                        const isRunning = running[test.id];

                        return (
                            <div
                                key={test.id}
                                className={cn(
                                    "p-4 border rounded-lg transition-colors",
                                    result?.status === "failure" ? "bg-red-50 border-red-200" : "bg-card hover:bg-muted/10",
                                    !result && !isRunning && "bg-muted/5 border-dashed"
                                )}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-sm">{test.name}</h3>
                                        {result && (
                                            <Badge variant={result.status === "success" ? "outline" : "destructive"}
                                                className={cn("text-[10px] h-5 px-1.5 font-normal", result.status === "success" && "text-green-600 border-green-200 bg-green-50")}>
                                                {result.status === "success" ? "OPERATIONAL" : "FAILED"}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => runTest(test.id, test.action)}
                                        disabled={isRunning || isRunningAll}
                                    >
                                        {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3 text-muted-foreground" />}
                                    </Button>
                                </div>

                                {isRunning ? (
                                    <div className="flex flex-col gap-2 py-2">
                                        <div className="h-2 w-full bg-muted/30 rounded overflow-hidden">
                                            <div className="h-full bg-primary/20 animate-progress origin-left w-full" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Running diagnostics...</p>
                                    </div>
                                ) : result ? (
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            {result.status === "success" ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                            )}
                                            <p className="text-sm text-foreground/80 leading-tight">
                                                {result.message}
                                            </p>
                                        </div>

                                        {result.details && Object.keys(result.details).length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t text-xs">
                                                {Object.entries(result.details).map(([key, value]) => (
                                                    <div key={key}>
                                                        <span className="text-muted-foreground block">{key}</span>
                                                        <span className="font-medium truncate block" title={String(value)}>{value}</span>
                                                    </div>
                                                ))}
                                                {result.duration !== undefined && (
                                                    <div>
                                                        <span className="text-muted-foreground block">Latency</span>
                                                        <span className={`font-medium ${result.duration > 1000 ? "text-yellow-600" : "text-green-600"}`}>
                                                            {result.duration}ms
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-3 text-center">
                                        <p className="text-xs text-muted-foreground">Diagnostics ready</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
