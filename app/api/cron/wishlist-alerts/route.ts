import prisma from "@/lib/db";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Case-insensitive header check + Fail Closed
    if (!cronSecret || (authHeader !== `Bearer ${cronSecret}`)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find items where current price is lower than added price (or last notified price)
        const wishlistItems = await prisma.wishlistItem.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                product: true,
                user: true
            }
        });

        // Process in parallel and sum results
        const results = await Promise.all(wishlistItems.map(async (item) => {
            const currentPrice = item.product.price;
            const baselinePrice = item.lastNotifiedPrice ?? item.addedPrice;

            // Check for 5% drop from baseline
            if (currentPrice < baselinePrice * 0.95 && item.user.email) {
                try {
                    await resend.emails.send({
                        from: "Aethelon <updates@aethelon.com>",
                        to: item.user.email,
                        subject: `Price Drop Alert: ${item.product.name} is on sale!`,
                        html: `
                            <h1>Good news, ${item.user.firstName}!</h1>
                            <p>An item in your wishlist has dropped in price.</p>
                            <p><strong>${item.product.name}</strong> is now <strong>$${(currentPrice / 100).toFixed(2)}</strong>.</p>
                            <p>Was: $${(baselinePrice / 100).toFixed(2)}</p>
                            <br/>
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://aethelon.com"}/shop/${item.product.id}">Buy Now</a>
                        `
                    });

                    // Update lastNotifiedPrice
                    await prisma.wishlistItem.update({
                        where: { id: item.id },
                        data: { lastNotifiedPrice: currentPrice }
                    });

                    return 1; // Email sent
                } catch (err) {
                    logger.error({ err }, `Failed to process alert for item ${item.id}`);
                    return 0;
                }
            }
            return 0;
        }));

        const emailsSent = results.reduce((a: number, b) => a + b, 0);

        return NextResponse.json({ success: true, emailsSent });
    } catch (error) {
        logger.error({ err: error }, "Wishlist Cron Error");
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
