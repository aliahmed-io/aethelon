"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, Clock, BarChart3, ArrowRight } from "lucide-react";
import { RevenueForecast, DemandForecast, simulateScenario, ScenarioResult } from "@/lib/ai/coo-data";
import { useState, useEffect } from "react";

interface ForecastViewProps {
    forecast: RevenueForecast | null;
    demandForecast: DemandForecast[] | null;
    isLoading: boolean;
    onLoad: () => void;
}

export function ForecastView({ forecast, demandForecast, isLoading, onLoad }: ForecastViewProps) {
    const [spendMultiplier, setSpendMultiplier] = useState(1);
    const [scenario, setScenario] = useState<ScenarioResult | null>(null);

    useEffect(() => {
        simulateScenario(spendMultiplier).then(setScenario);
    }, [spendMultiplier]);

    if (!forecast) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                <BarChart3 className="w-16 h-16 mb-6 text-white/10 stroke-1" />
                <h3 className="text-xl text-white font-light mb-2">Predictive Analytics</h3>
                <p className="text-white/40 mb-8 uppercase tracking-widest text-xs max-w-md">
                    Generate AI-driven revenue projections and inventory depletion forecasts.
                </p>
                <Button onClick={onLoad} disabled={isLoading} className="bg-white text-black hover:bg-zinc-200 rounded-none h-12 px-8 uppercase tracking-widest text-xs font-bold transition-all">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : null}
                    Initiate Forecast
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-12 w-full animate-in slide-in-from-right-8 duration-700">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-2xl font-light uppercase tracking-tight text-white">Forecast Results</h2>
                    <p className="text-white/40 text-xs mt-1">30-Day Projections</p>
                </div>
                <Button onClick={onLoad} disabled={isLoading} variant="outline" className="border-white/20 hover:bg-white/10 text-xs uppercase tracking-widest bg-transparent text-white rounded-none">
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : "Refresh"}
                </Button>
            </div>

            {/* Revenue Forecast */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Revenue Trajectory</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-[#050505] border border-white/10 rounded-sm">
                        <CardContent className="p-6 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Daily Run Rate</p>
                            <p className="text-4xl font-light text-white">${forecast.averageDailyRevenue.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#050505] border border-white/10 rounded-sm">
                        <CardContent className="p-6 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Weekly Projection</p>
                            <p className="text-4xl font-light text-white">${forecast.projectedWeekly.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#050505] border border-white/10 rounded-sm">
                        <CardContent className="p-6 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Trend Signal</p>
                            <div className="flex items-center justify-center gap-3">
                                {forecast.trend === "up" ? (
                                    <TrendingUp className="w-6 h-6 text-white" />
                                ) : forecast.trend === "down" ? (
                                    <TrendingDown className="w-6 h-6 text-white/40" />
                                ) : (
                                    <span className="text-white/20">—</span>
                                )}
                                <span className={`text-4xl font-light ${forecast.trend === "up" ? "text-white" : forecast.trend === "down" ? "text-white/60" : "text-white/40"}`}>
                                    {forecast.trendPercentage > 0 ? "+" : ""}{forecast.trendPercentage}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Demand Forecast */}
            {demandForecast && demandForecast.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Inventory Velocity</h3>
                    <div className="bg-[#050505] border border-white/10 rounded-sm overflow-hidden">
                        {demandForecast.slice(0, 5).map((item) => (
                            <div key={item.productId} className="flex items-center justify-between px-8 py-5 border-b border-white/5 last:border-0 hover:bg-white/[0.05] transition-colors group">
                                <div>
                                    <p className="text-sm text-white font-medium mb-1 group-hover:text-white transition-colors">{item.productName}</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-wider group-hover:text-white/60">
                                        Stock: {item.currentStock} · Consumption: {item.averageDailySales.toFixed(1)}/day
                                    </p>
                                </div>
                                <div className="text-right flex items-center gap-12">
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Stockout In</p>
                                        <div className="flex items-center justify-end gap-2">
                                            <Clock className={`w-3 h-3 ${item.daysUntilStockout <= 7 ? "text-white" : "text-white/40"}`} />
                                            <span className={`text-xl font-light ${item.daysUntilStockout <= 7 ? "text-white" : "text-white/60"}`}>
                                                {item.daysUntilStockout} <span className="text-xs opacity-50">days</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right min-w-[100px]">
                                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Reorder</p>
                                        <p className="text-xl text-white font-light">{item.suggestedReorderQuantity} <span className="text-xs opacity-50">units</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Scenario Planner */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Scenario Planner</h3>
                <Card className="bg-[#050505] border border-white/10 rounded-sm">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-12">
                            <div className="flex-1 space-y-8">
                                <div>
                                    <h4 className="text-lg text-white font-light mb-2">Marketing Spend Adjustment</h4>
                                    <p className="text-white/40 text-sm">Simulate revenue impact by increasing daily ad spend.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs uppercase tracking-widest text-white/60">
                                        <span>Current Spend</span>
                                        <span>+50% Increase</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="1.5"
                                        step="0.05"
                                        value={spendMultiplier}
                                        onChange={(e) => setSpendMultiplier(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-white/20 rounded-none appearance-none cursor-pointer accent-white"
                                    />
                                    <div className="text-center">
                                        <span className="inline-block px-3 py-1 bg-white/10 border border-white/10 text-[10px] font-mono text-white tracking-widest">
                                            +{Math.round((spendMultiplier - 1) * 100)}% SPEND
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {scenario && (
                                <div className="flex-1 grid grid-cols-2 gap-6 border-l border-white/5 pl-12">
                                    <div className="p-4 rounded-sm border border-transparent">
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Projected Revenue</p>
                                        <p className="text-2xl text-white font-light">${scenario.projectedRevenue.toLocaleString()}</p>
                                        <div className="mt-2 text-[10px] text-white/60">
                                            +${(scenario.projectedRevenue - (forecast?.projectedMonthly || 0)).toLocaleString()} Lift
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-sm border border-transparent">
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Est. ROI</p>
                                        <p className="text-2xl text-white font-light">{scenario.roi.toFixed(1)}x</p>
                                        <p className="text-[10px] text-white/30 mt-1">Return on Ad Spend</p>
                                    </div>
                                    <div className="col-span-2 text-center pt-2 border-t border-white/5 mt-2">
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-4">
                                            Projected Orders: <span className="text-white">{scenario.projectedOrders}</span> (+{scenario.projectedOrders - Math.round((forecast?.projectedMonthly || 0) / 3000 * 3000 / 2500)} approx)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
