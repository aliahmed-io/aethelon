"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("[Aethelon Error]", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center">
                {/* Error Icon */}
                <div className="inline-flex items-center justify-center w-24 h-24 border border-border rounded-full mb-8">
                    <AlertTriangle className="w-10 h-10 text-muted-foreground" />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold uppercase tracking-tighter text-foreground mb-4">
                    Something Went Wrong
                </h1>

                {/* Description */}
                <p className="text-muted-foreground font-light mb-8 max-w-md mx-auto">
                    We encountered an unexpected error. Our team has been notified and is working to resolve the issue.
                </p>

                {/* Error Details (Development) */}
                {process.env.NODE_ENV === "development" && (
                    <div className="bg-muted/50 border border-border p-6 rounded-sm mb-8 text-left">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Error Details</p>
                        <p className="text-sm text-red-600 font-mono break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-muted-foreground font-mono mt-2">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 text-sm uppercase tracking-widest font-bold hover:bg-accent/90 transition-colors rounded-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-2 border border-border text-foreground px-6 py-3 text-sm uppercase tracking-widest hover:bg-muted transition-colors rounded-sm"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>

                {/* Support Link */}
                <p className="text-xs text-muted-foreground mt-12">
                    If the problem persists, please{" "}
                    <Link href="/contact" className="text-foreground hover:text-accent underline underline-offset-4">
                        contact support
                    </Link>
                </p>
            </div>
        </div>
    );
}
