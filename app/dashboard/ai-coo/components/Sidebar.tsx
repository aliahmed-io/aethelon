"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    MessageSquare,
    TrendingUp,
    Activity,
    FileText,
    LogOut
} from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    className?: string;
}

function SidebarContent({ activeTab, onTabChange }: SidebarProps) {
    const navItems = [
        { id: "briefing", label: "Briefing", icon: LayoutDashboard },
        { id: "chat", label: "Live Console", icon: MessageSquare },
        { id: "forecast", label: "Forecasts", icon: TrendingUp },
        { id: "sentiment", label: "Sentiment", icon: Activity },
        { id: "reports", label: "Reports", icon: FileText },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-foreground to-muted flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-background rounded-full" />
                </div>
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Aethelon</h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Operations</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <Button
                        key={item.id}
                        variant="ghost"
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            "w-full justify-start h-12 text-xs uppercase tracking-widest font-medium transition-all px-4",
                            activeTab === item.id
                                ? "bg-card text-foreground shadow-sm border border-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <item.icon className={cn("w-4 h-4 mr-3", activeTab === item.id ? "text-accent" : "text-muted-foreground")} />
                        {item.label}
                    </Button>
                ))}
            </nav>

            {/* Footer */}
            <div className="pt-8 border-t border-border mt-auto space-y-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted pl-4"
                    onClick={() => window.location.href = "/dashboard"}
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    Exit Console
                </Button>

                <div className="px-4 py-4 bg-card rounded-sm border border-border mx-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">System Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs text-foreground">Operational</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Sidebar({ activeTab, onTabChange, className }: SidebarProps) {
    return (
        <div className={cn("w-64 border-r border-border bg-background/95 backdrop-blur-xl h-full p-4 flex-none z-50", className)}>
            <SidebarContent activeTab={activeTab} onTabChange={onTabChange} />
        </div>
    );
}

export function MobileSidebar({ activeTab, onTabChange }: SidebarProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Menu className="w-6 h-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-background border-r border-border p-4">
                <SidebarContent activeTab={activeTab} onTabChange={onTabChange} />
            </SheetContent>
        </Sheet>
    );
}
