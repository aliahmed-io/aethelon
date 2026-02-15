"use client";

import { Activity, TrendingUp, Users, Truck, AlertTriangle, Search, Bell } from "lucide-react";

export default function AdminCOOClient() {
    return (
        <div className="min-h-screen bg-[#F5F7FA] text-slate-800">

            {/* Top Navigation */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        A
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-lg leading-tight">Aethelon Command</h1>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            COO Mode Active
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search operations..."
                            className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    </button>
                    <div className="w-8 h-8 bg-slate-200 rounded-full border border-slate-300" />
                </div>
            </header>

            <main className="pt-24 px-8 pb-12 container mx-auto max-w-7xl">

                {/* KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "Total Revenue", value: "$124,500", change: "+15%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Inventory Health", value: "98%", change: "Optimal", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50" },
                        { label: "AI Efficiency", value: "450 hrs", change: "Saved", icon: SparklesIcon, color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "Active Users", value: "2,405", change: "+8%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    ].map((kpi: {
                        label: string;
                        value: string;
                        change: string;
                        icon: React.ComponentType<{ className?: string }>;
                        color: string;
                        bg: string;
                    }) => (
                        <div key={kpi.label} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                                    <kpi.icon className="w-5 h-5" />
                                </div>
                                <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.change.includes("+")
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-slate-100 text-slate-600"}`}
                                >
                                    {kpi.change}
                                </span>
                            </div>
                            <div className="text-2xl font-bold font-display text-slate-900">{kpi.value}</div>
                            <div className="text-sm text-slate-500">{kpi.label}</div>
                        </div>
                    ))}
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Supply Chain Map Panel */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display text-lg font-bold flex items-center gap-2">
                                <Truck className="w-5 h-5 text-slate-400" /> Supply Chain Intelligence
                            </h2>
                            <button className="text-sm text-indigo-600 font-medium hover:underline">View Full Map</button>
                        </div>

                        <div className="aspect-2/1 bg-slate-50 rounded-lg border border-slate-100 relative mb-6 overflow-hidden">
                            {/* Abstract Map Viz */}
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-display text-3xl opacity-20 select-none">Global Logistics Map</div>

                            {/* Alert Overlay */}
                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur border border-amber-200 rounded-lg p-4 flex items-start gap-4 shadow-lg animate-in slide-in-from-bottom duration-500">
                                <div className="bg-amber-100 p-2 rounded-full text-amber-600 mt-1">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">Delay Predicted: Dover Port</h4>
                                    <p className="text-sm text-slate-600 mb-2">Congestion increasing. Shipment #442 (Teak Wood) likely to be delayed by 48h.</p>
                                    <div className="flex gap-3">
                                        <button className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded font-medium hover:bg-indigo-700 transition-colors">
                                            Auto-Reroute via Rotterdam
                                        </button>
                                        <button className="text-xs border border-slate-300 text-slate-600 px-3 py-1.5 rounded font-medium hover:bg-slate-50 transition-colors">
                                            Notify Suppliers
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Pricing Panel */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display text-lg font-bold">Dynamic Pricing</h2>
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <SparklesIcon className="w-16 h-16" />
                                </div>
                                <h3 className="font-bold text-indigo-900 mb-1">Copenhagen Sofa</h3>
                                <p className="text-xs text-indigo-700 mb-4">Demand Surge Detected (+22%)</p>

                                <div className="flex justify-between items-end mb-2">
                                    <div className="text-sm text-slate-500">Current</div>
                                    <div className="font-mono text-slate-700">$4,850</div>
                                </div>
                                <div className="flex justify-between items-end mb-4">
                                    <div className="text-sm text-indigo-700 font-medium">AI Proposal</div>
                                    <div className="font-mono text-xl font-bold text-indigo-600">$4,950</div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button className="bg-white border border-indigo-200 text-indigo-600 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">Reject</button>
                                    <button className="bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">Approve</button>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Market Sentiment</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Positive</span>
                                        <span className="font-medium text-emerald-600">88%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full w-[88%]" />
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {["Quality", "Delivery", "Comfort", "Support"].map((tag) => (
                                            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    );
}
