"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface TryOnSession {
    id: string;
    status: string;
    resultImage: string | null;
    createdAt: Date;
    product: {
        name: string;
    };
}

export function HistorySheet({ sessions }: { sessions: TryOnSession[] }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <History className="w-4 h-4" />
                    View Full History
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto sm:max-w-xl w-full">
                <SheetHeader className="mb-6">
                    <SheetTitle>Try-On History</SheetTitle>
                </SheetHeader>

                <div className="grid grid-cols-2 gap-4">
                    {sessions.length === 0 ? (
                        <div className="col-span-2 text-center py-10 text-muted-foreground">
                            No history found.
                        </div>
                    ) : (
                        sessions.map((s) => (
                            <div key={s.id} className="relative aspect-[4/5] bg-muted rounded-lg overflow-hidden border">
                                {s.status === "COMPLETED" && s.resultImage ? (
                                    <Image
                                        src={s.resultImage}
                                        alt="Result"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-2 text-center">
                                        {s.status === "FAILED" ? (
                                            <span className="text-red-500 font-medium text-xs">Failed</span>
                                        ) : (
                                            <Loader2 className="animate-spin w-6 h-6 opacity-50" />
                                        )}
                                    </div>
                                )}
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-white">
                                    <p className="text-xs truncate font-medium">{s.product.name}</p>
                                    <p className="text-[10px] opacity-80">{new Date(s.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
