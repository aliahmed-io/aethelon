import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkIntegrations } from "@/lib/health";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export async function IntegrationHealthWidget() {
    const healthData = await checkIntegrations();

    return (
        <Card className="mb-8">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-medium">System Health</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {healthData.map((item) => {
                        let icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
                        let color = "bg-green-100 text-green-800 border-green-200";

                        if (item.status === "unhealthy") {
                            icon = <XCircle className="h-5 w-5 text-red-500" />;
                            color = "bg-red-100 text-red-800 border-red-200";
                        } else if (item.status === "misconfigured") {
                            icon = <AlertTriangle className="h-5 w-5 text-yellow-500" />;
                            color = "bg-yellow-100 text-yellow-800 border-yellow-200";
                        }

                        return (
                            <div
                                key={item.service}
                                className={cn("flex flex-col items-center justify-center p-2 border rounded-lg", color)}
                            >
                                <div className="mb-1">{icon}</div>
                                <span className="text-sm font-medium text-center">{item.service}</span>
                                {item.message && <span className="text-[10px] text-muted-foreground text-center mt-1">{item.message}</span>}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
