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
        console.error("[Velorum Error]", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center">
                {/* Error Icon */}
                <div className="inline-flex items-center justify-center w-24 h-24 border border-white/10 rounded-full mb-8">
                    <AlertTriangle className="w-10 h-10 text-white/60" />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mb-4">
                    Something Went Wrong
                </h1>

                {/* Description */}
                <p className="text-white/50 font-light mb-8 max-w-md mx-auto">
                    We encountered an unexpected error. Our team has been notified and is working to resolve the issue.
                </p>

                {/* Error Details (Development) */}
                {process.env.NODE_ENV === "development" && (
                    <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-sm mb-8 text-left">
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Error Details</p>
                        <p className="text-sm text-red-400 font-mono break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-white/30 font-mono mt-2">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="flex items-center gap-2 bg-white text-black px-6 py-3 text-sm uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-2 border border-white/20 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-white/5 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>

                {/* Support Link */}
                <p className="text-xs text-white/30 mt-12">
                    If the problem persists, please{" "}
                    <Link href="/contact" className="text-white/50 hover:text-white underline underline-offset-4">
                        contact support
                    </Link>
                </p>
            </div>
        </div>
    );
}
