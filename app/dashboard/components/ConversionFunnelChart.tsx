"use client";

import { TrendingDown, TrendingUp, Users, Eye, ShoppingCart, CreditCard, Package } from "lucide-react";

interface FunnelStage {
    name: string;
    count: number;
    percentage: number;
    dropoff: number;
}

interface ConversionFunnelChartProps {
    stages: FunnelStage[];
    overallRate: number;
}

const stageIcons = [Users, Eye, ShoppingCart, CreditCard, Package];

export function ConversionFunnelChart({ stages, overallRate }: ConversionFunnelChartProps) {
    const maxCount = Math.max(...stages.map(s => s.count));

    return (
        <div className="space-y-6">
            {/* Overall Rate */}
            <div className="flex items-center justify-between p-4 bg-card border border-border shadow-sm rounded-sm">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Overall Conversion Rate</p>
                    <p className="text-3xl font-light text-foreground mt-1">{overallRate.toFixed(2)}%</p>
                </div>
                <div className={`flex items-center gap-1 ${overallRate >= 2 ? "text-emerald-600" : "text-amber-500"}`}>
                    {overallRate >= 2 ? (
                        <TrendingUp className="w-5 h-5" />
                    ) : (
                        <TrendingDown className="w-5 h-5" />
                    )}
                    <span className="text-xs uppercase tracking-widest font-medium">
                        {overallRate >= 2 ? "Healthy" : "Needs Attention"}
                    </span>
                </div>
            </div>

            {/* Funnel Visualization */}
            <div className="space-y-3">
                {stages.map((stage, index) => {
                    const Icon = stageIcons[index] || Users;
                    const barWidth = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;

                    return (
                        <div key={stage.name} className="space-y-2 group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-muted rounded-full">
                                        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </div>
                                    <span className="text-sm text-foreground font-medium">{stage.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-foreground font-mono">
                                        {stage.count.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-muted-foreground w-16 text-right">
                                        {stage.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Bar */}
                            <div className="h-8 bg-muted/40 relative overflow-hidden rounded-sm">
                                <div
                                    className="h-full bg-gradient-to-r from-accent/80 to-accent/60 transition-all duration-500"
                                    style={{ width: `${barWidth}%` }}
                                />
                                {index > 0 && stage.dropoff > 0 && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-red-500 font-medium">
                                        -{stage.dropoff.toFixed(1)}% dropoff
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-border text-[10px] text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent/60 rounded-sm" />
                    <span>Volume</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">-X%</span>
                    <span>Stage Dropoff</span>
                </div>
            </div>
        </div>
    );
}
