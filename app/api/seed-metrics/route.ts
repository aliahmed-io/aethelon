import Prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const data = await Prisma.storeMetrics.upsert({
            where: { id: "singleton" },
            update: {},
            create: {
                id: "singleton",
                // Engine Analytics
                arCheckoutRate: 6.2,
                standardCheckoutRate: 1.1,
                vaultAov: 4850,
                standardAov: 1240,
                arReturnRate: 2.4,
                standardReturnRate: 18.5,
                estimatedSavings: 12450,
                semanticQueries: [
                    { query: "\"dark modern reading chair apartment\"", path: "Routed to Executive Chair", status: "CONVERTED (0.92)", color: "emerald" },
                    { query: "\"huge living room centerpiece minimal\"", path: "Routed to Atelier Sofa", status: "CLICKED (0.88)", color: "amber" },
                    { query: "\"velvet blue ottoman lounge\"", path: "0 Results Found", status: "MISS", color: "rose" }
                ],
                abandonedValue: 45000,
                recovered1Hr: 4200,
                recovered24Hr: 2100,

                // Shopify Parity
                funnelAddedToCart: 7.04,
                funnelReachedCheckout: 7.04,
                funnelPurchased: 5.63,
                repeatCustomerRate: 5.43,
                firstTimePercentage: 85,
                returningPercentage: 15,
                topLandingPages: [
                    { path: "/vault/atelier-sofa", visits: "14,234", trend: "up", val: "5.8%" },
                    { path: "/", visits: "12,145", trend: "up", val: "3.2%" },
                    { path: "/shop", visits: "8,230", trend: "up", val: "2.1%" },
                    { path: "/shop/executive-chair", visits: "6,412", trend: "down", val: "4.8%" },
                    { path: "/ar-visualizer", visits: "3,110", trend: "up", val: "9.8%" }
                ],
                deviceDesktop: 267,
                deviceMobile: 184,
                deviceTablet: 0,
                trafficSources: [
                    { source: "Direct", visits: "201", trend: "up", val: "5.8%" },
                    { source: "Search", visits: "167", trend: "up", val: "3.2%" },
                    { source: "Social", visits: "43", trend: "up", val: "2.1%" },
                    { source: "Referrals", visits: "12", trend: "down", val: "4.8%" },
                    { source: "Email", visits: "9", trend: "up", val: "9.8%" }
                ],
                socialSources: [
                    { source: "Facebook", visits: "167", trend: "up", val: "5.8%" },
                    { source: "Instagram", visits: "93", trend: "down", val: "3.2%" },
                    { source: "Pinterest", visits: "67", trend: "up", val: "2.1%" },
                    { source: "Twitter", visits: "34", trend: "down", val: "4.8%" },
                    { source: "Reddit", visits: "7", trend: "up", val: "9.8%" }
                ]
            }
        });

        return NextResponse.json({ success: true, message: "StoreMetrics singleton seeded.", data });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
