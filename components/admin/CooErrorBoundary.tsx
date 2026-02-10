"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class CooErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("AI COO Error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            Analysis Failed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-red-600">
                            The AI service is currently unavailable or timed out. Please try again later.
                        </p>
                        <Button
                            variant="outline"
                            className="border-red-200 hover:bg-red-100 text-red-700"
                            onClick={() => {
                                this.setState({ hasError: false });
                                window.location.reload();
                            }}
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Retry Analysis
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}
