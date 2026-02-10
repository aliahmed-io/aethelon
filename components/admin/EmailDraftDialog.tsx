"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateEmailDraft } from "@/app/store/dashboard/ai-coo/actions";
import { Loader2, Copy, Check, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

interface EmailDraftDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    suggestion: {
        id: string;
        title: string;
        description: string;
    } | null;
}

export function EmailDraftDialog({ open, onOpenChange, suggestion }: EmailDraftDialogProps) {
    const [loading, setLoading] = useState(false);
    const [draft, setDraft] = useState<{ subject: string; preheader: string; body: string; explanation: string } | null>(null);
    const [hasCopied, setHasCopied] = useState(false);

    // Reset state when opening
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Slight delay to clear state after animation
            setTimeout(() => {
                setDraft(null);
                setLoading(false);
            }, 300);
        }
        onOpenChange(newOpen);
    };

    const handleGenerate = async () => {
        if (!suggestion) return;
        setLoading(true);
        setDraft(null);

        try {
            const context = `Action: ${suggestion.title}. Context: ${suggestion.description}`;
            const res = await generateEmailDraft(context, suggestion.id);

            if (res.success && res.draft) {
                setDraft(res.draft);
            } else {
                toast.error("Failed to generate draft. Please try again.");
                onOpenChange(false);
            }
        } catch (e) {
            console.error(e);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!draft) return;
        const text = `Subject: ${draft.subject}\nPreheader: ${draft.preheader}\n\n${draft.body}`;
        navigator.clipboard.writeText(text);
        setHasCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        AI Email Composer
                    </DialogTitle>
                    <DialogDescription>
                        {suggestion ? `Drafting campaign for: "${suggestion.title}"` : "Drafting your campaign..."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 px-1 space-y-4">
                    {!draft && !loading && (
                        <div className="flex flex-col items-center justify-center h-40 space-y-4">
                            <p className="text-muted-foreground text-center max-w-sm">
                                Ready to draft a high-converting email based on this insight?
                            </p>
                            <Button onClick={handleGenerate} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Draft
                            </Button>
                        </div>
                    )}

                    {loading && (
                        <div className="space-y-4 animate-pulse">
                            <div className="space-y-2">
                                <div className="h-4 w-16 bg-muted rounded" />
                                <div className="h-10 w-full bg-muted rounded" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-muted rounded" />
                                <div className="h-32 w-full bg-muted rounded" />
                            </div>
                            <div className="flex items-center justify-center pt-4">
                                <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Writing copy...
                                </div>
                            </div>
                        </div>
                    )}

                    {draft && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Insight Explanation */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-xs text-indigo-800 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                                <strong>AI Insight:</strong> {draft.explanation}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="subject">Subject Line</Label>
                                    <Input
                                        id="subject"
                                        value={draft.subject}
                                        onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                                        className="font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="preheader">Preheader</Label>
                                    <Input
                                        id="preheader"
                                        value={draft.preheader}
                                        onChange={(e) => setDraft({ ...draft, preheader: e.target.value })}
                                        className="text-muted-foreground"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="body">Email Body (HTML)</Label>
                                <Textarea
                                    id="body"
                                    value={draft.body}
                                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                                    className="min-h-[300px] font-mono text-sm leading-relaxed"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {draft && (
                    <DialogFooter className="gap-2 sm:gap-0">
                        <div className="flex w-full justify-between items-center">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={copyToClipboard}>
                                    {hasCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                    {hasCopied ? "Copied" : "Copy HTML"}
                                </Button>
                                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => toast.success("Sent to test email!")}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Test
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
