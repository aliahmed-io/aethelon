import { Suspense } from "react";
import { COOClient } from "./COOClient";
import { generateMorningBriefing, generateRecommendations } from "@/lib/ai/coo-service";
import { getFullBusinessContext } from "@/lib/ai/coo-data";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

async function AIContent() {
    const [briefing, recommendations, context] = await Promise.all([
        generateMorningBriefing(),
        generateRecommendations(),
        getFullBusinessContext(),
    ]);

    return (
        <COOClient
            initialBriefing={briefing}
            initialRecommendations={recommendations}
            businessContext={context}
        />
    );
}

function LoadingState() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
                <p className="text-muted-foreground text-sm uppercase tracking-widest">
                    Initializing AI COO...
                </p>
            </div>
        </div>
    );
}

export default function AICOOPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AIContent />
        </Suspense>
    );
}
