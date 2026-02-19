import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendEmailSafe, getResendFromEmail } from "@/lib/resend";
import logger from "@/lib/logger";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageString?: string;
}

interface CartData {
    items: CartItem[];
}

function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

function generateCartEmailHtml(
    items: CartItem[],
    totalCents: number,
    isSecondEmail: boolean,
    recoveryLink: string
): string {
    const itemRows = items
        .map(
            (item) => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                ${item.name}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                ${formatPrice(item.price * item.quantity)}
            </td>
        </tr>`
        )
        .join("");

    const urgencyBlock = isSecondEmail
        ? `<p style="color: #b45309; font-weight: 600; margin: 16px 0;">
            ⏰ Items in your cart are selling fast. Complete your purchase before they're gone.
           </p>`
        : "";

    return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #0a0a0a; padding: 32px; text-align: center;">
            <h1 style="color: #fafafa; font-size: 24px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; margin: 0;">
                AETHELON
            </h1>
        </div>

        <div style="padding: 32px;">
            <h2 style="font-size: 20px; font-weight: 400; margin-bottom: 8px;">
                ${isSecondEmail ? "Still thinking it over?" : "You left something behind"}
            </h2>
            <p style="color: #6b7280; line-height: 1.6;">
                ${isSecondEmail
            ? "Your curated selection is still waiting. We've held your items, but we can't guarantee availability for much longer."
            : "It looks like you left some beautiful pieces in your cart. We've saved them for you."}
            </p>

            ${urgencyBlock}

            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                <thead>
                    <tr style="background: #f9fafb;">
                        <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Item</th>
                        <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Qty</th>
                        <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRows}
                </tbody>
            </table>

            <div style="text-align: right; font-size: 18px; font-weight: 600; margin: 16px 0;">
                Total: ${formatPrice(totalCents)}
            </div>

            <div style="text-align: center; margin: 32px 0;">
                <a href="${recoveryLink}"
                   style="display: inline-block; background: #0a0a0a; color: #fafafa; padding: 14px 48px; text-decoration: none; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                    Complete Your Purchase
                </a>
            </div>
        </div>

        <div style="background: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p>If you have any questions, reply to this email.</p>
            <p style="margin-top: 8px;">© ${new Date().getFullYear()} Aethelon. All rights reserved.</p>
        </div>
    </div>`;
}

export async function GET(request: Request) {
    // 1. Authenticate Cron Request
    const authHeader = request.headers.get("authorization");
    if (
        !process.env.CRON_SECRET ||
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let emailsSentCount = 0;
    let errorsCount = 0;

    try {
        // 2. Find carts eligible for Email 1 (created > 1h ago, 0 emails sent, no manual intervention)
        const firstEmailCarts = await prisma.abandonedCart.findMany({
            where: {
                recoveredAt: null,
                manualIntervention: false,
                emailsSent: 0,
                createdAt: { lte: oneHourAgo },
            },
            take: 50,
        });

        for (const cart of firstEmailCarts) {
            try {
                const cartData = cart.cartData as unknown as CartData;
                if (!cartData?.items?.length) continue;

                let token = cart.recoveryToken;
                if (!token) {
                    token = crypto.randomUUID();
                    await prisma.abandonedCart.update({
                        where: { id: cart.id },
                        data: { recoveryToken: token },
                    });
                }

                const recoveryLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://aethelon.com"}/api/recover-cart?token=${token}`;

                await sendEmailSafe({
                    from: getResendFromEmail(),
                    to: cart.email,
                    subject: "You left something behind ✨",
                    html: generateCartEmailHtml(
                        cartData.items,
                        cart.totalCents,
                        false,
                        recoveryLink
                    ),
                });

                await prisma.abandonedCart.update({
                    where: { id: cart.id },
                    data: { emailsSent: 1, lastEmailAt: now },
                });

                emailsSentCount++;
            } catch (err) {
                logger.error({ cartId: cart.id, err }, "Abandoned Cart Email 1 Failed");
                errorsCount++;
            }
        }

        // 3. Find carts eligible for Email 2 (created > 24h ago, 1 email sent, no manual intervention)
        const secondEmailCarts = await prisma.abandonedCart.findMany({
            where: {
                recoveredAt: null,
                manualIntervention: false,
                emailsSent: 1,
                createdAt: { lte: twentyFourHoursAgo },
            },
            take: 50,
        });

        for (const cart of secondEmailCarts) {
            try {
                const cartData = cart.cartData as unknown as CartData;
                if (!cartData?.items?.length) continue;

                let token = cart.recoveryToken;
                if (!token) {
                    token = crypto.randomUUID();
                    await prisma.abandonedCart.update({
                        where: { id: cart.id },
                        data: { recoveryToken: token },
                    });
                }

                const recoveryLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://aethelon.com"}/api/recover-cart?token=${token}`;

                await sendEmailSafe({
                    from: getResendFromEmail(),
                    to: cart.email,
                    subject: "Your cart is waiting — items selling fast ⏰",
                    html: generateCartEmailHtml(
                        cartData.items,
                        cart.totalCents,
                        true,
                        recoveryLink
                    ),
                });

                await prisma.abandonedCart.update({
                    where: { id: cart.id },
                    data: { emailsSent: 2, lastEmailAt: now },
                });

                emailsSentCount++;
            } catch (err) {
                logger.error({ cartId: cart.id, err }, "Abandoned Cart Email 2 Failed");
                errorsCount++;
            }
        }

        logger.info(
            {
                firstEligible: firstEmailCarts.length,
                secondEligible: secondEmailCarts.length,
                emailsSent: emailsSentCount,
                errors: errorsCount,
            },
            "Abandoned Cart Cron Complete"
        );

        return NextResponse.json({
            success: true,
            emailsSent: emailsSentCount,
            errors: errorsCount,
        });
    } catch (error) {
        logger.error({ error }, "Abandoned Cart Cron Fatal Error");
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
