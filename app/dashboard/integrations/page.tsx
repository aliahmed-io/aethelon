import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
    await requireAdmin();

    const integrations = [
        {
            name: "Stripe",
            description: "Payments & Checkout",
            envKey: "STRIPE_SECRET_KEY",
            publicEnvKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
            status: process.env.STRIPE_SECRET_KEY ? "connected" : "missing",
        },
        {
            name: "Shippo",
            description: "Shipping Rates & Labels",
            envKey: "SHIPPO_API_KEY", // Corrected from SHIPPO_API_TOKEN
            status: process.env.SHIPPO_API_KEY ? "connected" : "missing",
        },
        {
            name: "Resend",
            description: "Transactional Emails",
            envKey: "RESEND_API_KEY",
            status: process.env.RESEND_API_KEY ? "connected" : "missing",
        },
        {
            name: "Kinde Auth",
            description: "User Authentication",
            envKey: "KINDE_CLIENT_SECRET",
            status: process.env.KINDE_CLIENT_SECRET ? "connected" : "missing",
        },
        {
            name: "Google Gemini",
            description: "AI Generation",
            envKey: "GEMINI_API_KEY", // Corrected from GOOGLE_GENERATIVE_AI_API_KEY
            status: process.env.GEMINI_API_KEY ? "connected" : "missing",
        },
        {
            name: "Meshy AI",
            description: "3D Model Generation",
            envKey: "MESHY_API_KEY",
            status: process.env.MESHY_API_KEY ? "connected" : "missing",
        }
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Integration Hub</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map((integration) => (
                    <Card key={integration.name} className={integration.status === "missing" ? "border-red-200 bg-red-50/10" : "border-green-200 bg-green-50/5"}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                {integration.status === "connected" ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                )}
                            </div>
                            <CardDescription>{integration.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mt-2 text-sm">
                                <span className="text-muted-foreground font-mono text-xs">{integration.envKey}</span>
                                <Badge variant={integration.status === "connected" ? "success" : "destructive"}>
                                    {integration.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between border-b pb-2">
                        <span>Database Connection (Prisma)</span>
                        <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 pt-2">
                        <span>Redis Cache (Upstash)</span>
                        <span className={process.env.UPSTASH_REDIS_REST_URL ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                            {process.env.UPSTASH_REDIS_REST_URL ? "Active" : "Disabled (Local Fallback)"}
                        </span>
                    </div>
                    <div className="flex justify-between pt-2">
                        <span>Node Environment</span>
                        <span className="font-mono">{process.env.NODE_ENV}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
