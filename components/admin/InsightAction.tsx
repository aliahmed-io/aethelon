"use client";

import { Button } from "@/components/ui/button";
import { CooSuggestion } from "@/lib/ai/coo";
import { EmailDraftDialog } from "./EmailDraftDialog";
import { useState } from "react";
import { ArrowRight, PenTool } from "lucide-react";
import { toast } from "sonner";

export function InsightAction({ suggestion }: { suggestion: CooSuggestion }) {
    const [emailOpen, setEmailOpen] = useState(false);

    const handleAction = () => {
        if (suggestion.type === "EMAIL") {
            setEmailOpen(true);
        } else {
            // For other types, we'd navigate or show other dialogs
            toast.info("This action is not yet automated. Coming soon!");
        }
    };

    return (
        <>
            <Button
                className="w-full mt-2"
                variant={suggestion.type === "EMAIL" ? "default" : "secondary"}
                onClick={handleAction}
            >
                {suggestion.type === "EMAIL" ? (
                    <>
                        <PenTool className="w-4 h-4 mr-2" />
                        Draft Campaign
                    </>
                ) : (
                    <>
                        Review Action
                        <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
                    </>
                )}
            </Button>

            <EmailDraftDialog
                open={emailOpen}
                onOpenChange={setEmailOpen}
                suggestion={suggestion}
            />
        </>
    );
}
