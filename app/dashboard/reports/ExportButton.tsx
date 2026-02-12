"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportOrders, exportUsers, exportRevenue } from "@/app/actions/export-data";

type ExportType = "orders" | "users" | "revenue";

interface ExportButtonProps {
    type: ExportType;
    label?: string;
    variant?: "default" | "outline" | "ghost" | "secondary" | "link" | "destructive";
    className?: string;
}

export function ExportButton({ type, label = "Export CSV", variant = "default", className }: ExportButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            let result;
            switch (type) {
                case "orders":
                    result = await exportOrders();
                    break;
                case "users":
                    result = await exportUsers();
                    break;
                case "revenue":
                    result = await exportRevenue();
                    break;
            }

            if (result.success && result.data) {
                // Create blob and download link
                const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", result.filename || "export.csv");
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success(`${label} downloaded successfully`);
            } else {
                toast.error(result.error || "Failed to export data");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            className={className}
            onClick={handleExport}
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            {label}
        </Button>
    );
}
