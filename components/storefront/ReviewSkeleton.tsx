import { Skeleton } from "@/components/ui/skeleton";

export function ReviewSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 border-b pb-6 last:border-b-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-24" />
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, j) => (
                                    <Skeleton key={j} className="h-4 w-4" />
                                ))}
                            </div>
                        </div>
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}
