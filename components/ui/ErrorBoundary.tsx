"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        if (this.props.onError) {
            this.props.onError();
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
                    <p className="text-red-500 font-medium mb-2">Something went wrong</p>
                    <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false })}>
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
