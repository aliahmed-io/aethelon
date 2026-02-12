"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { generateCampaignContent } from "@/app/store/ai-actions";
import { toast } from "sonner";

interface CampaignGeneratorProps {
    onGenerate: (data: { subject: string; preheader: string; body: string }) => void;
    selectedProductNames: string[];
}

export function CampaignGenerator({ onGenerate, selectedProductNames }: CampaignGeneratorProps) {
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!topic) {
            toast.error("Please enter a campaign topic");
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateCampaignContent(topic, selectedProductNames);
            if (result.success && result.data) {
                onGenerate(result.data);
                toast.success("Campaign content generated!");
            } else {
                toast.error(result.error || "Failed to generate content");
            }
        } catch (_e) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-card border border-border p-6 rounded-sm space-y-4 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-500/10 rounded-sm">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">AI Campaign Architect</h3>
            </div>

            <div className="grid gap-4 sm:flex sm:items-end">
                <div className="flex-1 space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Campaign Topic / Goal</Label>
                    <Input
                        placeholder="e.g., Summer Clearance, New Arrival Launch, VIP Exclusive"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="bg-background/50"
                    />
                </div>
                <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest w-full sm:w-auto"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Generate
                </Button>
            </div>

            {selectedProductNames.length > 0 && (
                <p className="text-[10px] text-muted-foreground">
                    Using context from: <span className="text-foreground">{selectedProductNames.slice(0, 3).join(", ")}{selectedProductNames.length > 3 ? ` +${selectedProductNames.length - 3} more` : ""}</span>
                </p>
            )}
        </div>
    );
}
