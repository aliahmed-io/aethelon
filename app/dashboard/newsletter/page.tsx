
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Sparkles } from "lucide-react";

export default function NewsletterPage() {
    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <h2 className="text-xl font-light tracking-tight uppercase">Broadcast & Newsletter</h2>
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
                    <Sparkles className="w-4 h-4" />
                    AI Assistant Active
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Stats */}
                <div className="space-y-6">
                    <Card className="p-6 bg-white/5 border-white/10 text-white">
                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Subscribers</span>
                        <div className="text-3xl font-light mt-2">12,408</div>
                        <div className="text-xs text-green-400 mt-1">+142 this week</div>
                    </Card>

                    <Card className="p-6 bg-white/5 border-white/10 text-white">
                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Avg Open Rate</span>
                        <div className="text-3xl font-light mt-2">48.2%</div>
                        <div className="text-xs text-white/30 mt-1 mb-4">Industry Avg: 21%</div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-[48%] bg-white" />
                        </div>
                    </Card>
                </div>

                {/* Right: Composer */}
                <div className="lg:col-span-2">
                    <Card className="p-6 bg-white/5 border-white/10 text-white space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Campaign Title</label>
                            <Input className="bg-black/40 border-white/10 text-white" placeholder="e.g. The New Pilot's Chronograph 41" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/40">Content</label>
                                <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Generate with AI
                                </button>
                            </div>
                            <Textarea className="bg-black/40 border-white/10 text-white min-h-[300px]" placeholder="Draft your message..." />
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div className="text-xs text-white/40">
                                Target: <span className="text-white">All Subscribers</span>
                            </div>
                            <Button className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-wider">
                                <Send className="w-4 h-4 mr-2" /> Send Broadcast
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
