import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
    console.log("Seeding StoreMetrics...");
    const payload = {
        id: "singleton",
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
    };

    // @ts-ignore
    await prisma.storeMetrics.upsert({
        where: { id: "singleton" },
        update: payload,
        create: payload
    });
    console.log("Successfully seeded StoreMetrics!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
