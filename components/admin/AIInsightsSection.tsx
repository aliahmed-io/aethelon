import { generateCooBrief } from "@/lib/ai/coo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Mail, Tag, Star } from "lucide-react";
import { InsightAction } from "./InsightAction";

export async function AIInsightsSection() {
    // This is the slow part!
    const brief = await generateCooBrief();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
                <CardHeader>
                    <CardTitle className="text-indigo-900">Morning Briefing</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-indigo-800 leading-relaxed font-medium">
                        {brief.summary}
                    </p>
                </CardContent>
            </Card>

            {/* Suggestions Grid */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Strategic Suggestions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {brief.suggestions.map((suggestion) => (
                        <Card key={suggestion.id} className="hover:shadow-lg transition-shadow border-t-4 border-t-indigo-500 flex flex-col">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-indigo-100 rounded-full">
                                        {suggestion.type === "DISCOUNT" && <Tag className="h-5 w-5 text-indigo-600" />}
                                        {suggestion.type === "EMAIL" && <Mail className="h-5 w-5 text-indigo-600" />}
                                        {suggestion.type === "REVIEW" && <Star className="h-5 w-5 text-indigo-600" />}
                                        {suggestion.type === "RESTOCK" && <TrendingUp className="h-5 w-5 text-indigo-600" />}
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground px-2 py-1 bg-muted rounded">
                                        {suggestion.type}
                                    </span>
                                </div>
                                <CardTitle className="text-lg leading-tight">{suggestion.title}</CardTitle>
                                <CardDescription className="line-clamp-3 mt-2">{suggestion.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto pt-0">
                                <InsightAction suggestion={suggestion} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
