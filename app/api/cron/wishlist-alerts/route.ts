import prisma from "@/lib/db";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
    if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find items where current price is lower than added price (or last notified price)
        // We want to notify if price < addedPrice AND price < (lastNotifiedPrice ?? Infinity)
        // Actually, let's just checking if current price is significantly lower than addedPrice (e.g. 5%)
        // AND lower than lastNotifiedPrice to avoid spam.

        // Optimization: Limit to 50 items per run to prevent timeout
        // Since this runs frequently (e.g. hourly/daily), it will eventually catch up.
        const wishlistItems = await prisma.wishlistItem.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' }, // Check newest first or shuffle? explicit order is better.
            include: {
                product: true,
                user: true
            }
        });

        let emailsSent = 0;

        // Process in parallel
        await Promise.all(wishlistItems.map(async (item) => {
            const currentPrice = item.product.price;
            const baselinePrice = item.lastNotifiedPrice ?? item.addedPrice;

            // Check for 5% drop from baseline
            if (currentPrice < baselinePrice * 0.95) {
                // Send Email
                if (item.user.email) {
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
                                <a href="https://aethelon.com/shop/${item.product.id}">Buy Now</a>
                            `
                        });

                        // Update lastNotifiedPrice
                        await prisma.wishlistItem.update({
                            where: { id: item.id },
                            data: { lastNotifiedPrice: currentPrice }
                        });

                        emailsSent++;
                    } catch (err) {
                        logger.error(`Failed to process alert for item ${item.id}`, err);
                    }
                }
            }
        }));

        return NextResponse.json({ success: true, emailsSent });
    } catch (error) {
        logger.error("Wishlist Cron Error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
