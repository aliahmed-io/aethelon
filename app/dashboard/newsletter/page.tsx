import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Sparkles } from "lucide-react";

export default function NewsletterPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-border pb-4">
                <h2 className="text-3xl font-light tracking-tight uppercase text-foreground">Broadcast &amp; Newsletter</h2>
                <div className="flex items-center gap-2 text-xs font-mono text-accent">
                    <Sparkles className="w-4 h-4" />
                    AI Assistant Active
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Stats */}
                <div className="space-y-6">
                    <Card className="p-6 bg-card border-border">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Subscribers</span>
                        <div className="text-3xl font-light mt-2 text-foreground">—</div>
                        <div className="text-xs text-muted-foreground mt-1">Connect email provider to view</div>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg Open Rate</span>
                        <div className="text-3xl font-light mt-2 text-foreground">—</div>
                        <div className="text-xs text-muted-foreground mt-1 mb-4">Requires email integration</div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full w-0 bg-foreground" />
                        </div>
                    </Card>
                </div>

                {/* Right: Composer */}
                <div className="lg:col-span-2">
                    <Card className="p-6 bg-card border-border space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Campaign Title</label>
                            <Input className="bg-background border-border text-foreground" placeholder="e.g. The New Pilot's Chronograph 41" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content</label>
                                <button className="text-xs text-accent hover:text-accent/80 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Generate with AI
                                </button>
                            </div>
                            <Textarea className="bg-background border-border text-foreground min-h-[300px]" placeholder="Draft your message..." />
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-border">
                            <div className="text-xs text-muted-foreground">
                                Target: <span className="text-foreground">All Subscribers</span>
                            </div>
                            <Button disabled className="font-bold uppercase tracking-wider bg-foreground text-background hover:bg-foreground/90 opacity-50 cursor-not-allowed">
                                <Send className="w-4 h-4 mr-2" /> Send Broadcast
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">Email sending requires integration with a provider (e.g. Resend).</p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
