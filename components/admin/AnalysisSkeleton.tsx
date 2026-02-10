import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function AnalysisSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Summary Card Skeleton */}
            <Card className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-indigo-100">
                <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[90%]" />
                        <Skeleton className="h-4 w-[95%]" />
                    </div>
                </CardContent>
            </Card>

            {/* Suggestions Grid Skeleton */}
            <div>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="border-t-4 border-t-gray-200">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-6 w-16 rounded" />
                                </div>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full mt-4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                    <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse mx-auto" />
                    <p className="text-muted-foreground font-medium">Analyzing store data... this may take a moment</p>
                </div>
            </div>
        </div>
    );
}
