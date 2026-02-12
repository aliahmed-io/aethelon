"use server";

import prisma from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface PriceDropAlert {
    userId: string;
    email: string;
    name: string;
    products: {
        id: string;
        name: string;
        oldPrice: number;
        newPrice: number;
        image: string;
    }[];
}

export async function checkPriceDrops() {
    // 1. Find all wishlist items where current product price < addedPrice
    const items = await prisma.wishlistItem.findMany({
        where: {
            product: {
                status: "published"
            }
        },
        include: {
            product: {
                select: { id: true, name: true, price: true, images: true }
            },
            user: {
                select: { id: true, email: true, firstName: true }
            }
        }
    });

    // Filter purely in JS for simplicity as we can't easily do field comparison in standard Prisma query 
    // without raw SQL or extensions for this specific logic
    const drops = items.filter(item => item.product.price < item.addedPrice);

    if (drops.length === 0) return { count: 0 };

    // Group by user
    const alerts: Record<string, PriceDropAlert> = {};

    for (const item of drops) {
        if (!alerts[item.userId]) {
            alerts[item.userId] = {
                userId: item.userId,
                email: item.user.email,
                name: item.user.firstName || "Valued Customer",
                products: []
            };
        }

        alerts[item.userId].products.push({
            id: item.product.id,
            name: item.product.name,
            oldPrice: item.addedPrice,
            newPrice: item.product.price,
            image: item.product.images[0] || ""
        });
    }

    // Send Emails (Mocking send for now if no key, or logging)
    let emailCount = 0;
    for (const alert of Object.values(alerts)) {
        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: "Aethelon <alerts@aethelon.com>",
                to: alert.email,
                subject: "Price Drop Alert: Items in your wishlist are on sale",
                html: generatePriceDropEmailHtml(alert.name, alert.products)
            });
            emailCount++;
        } else {
            console.log("Mock Email to", alert.email, "for price drops", alert.products.length);
        }
    }

    return { count: emailCount, dropsFound: drops.length };
}


function generatePriceDropEmailHtml(customerName: string, products: PriceDropAlert["products"]): string {
    const productRows = products.map(p => `
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 16px;">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="${p.image}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover;" />
                    <div>
                        <p style="margin: 0; font-size: 14px; font-weight: 500;">${p.name}</p>
                        <p style="margin: 4px 0 0; font-size: 12px; color: #ef4444;">
                            <span style="text-decoration: line-through; opacity: 0.5;">$${p.oldPrice}</span> 
                            <span style="font-weight: bold;">$${p.newPrice}</span>
                        </p>
                    </div>
                </div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right;">
                <a href="https://aethelon.geneve.com/shop/${p.id}" 
                   style="display: inline-block; padding: 8px 16px; background: #fff; color: #000; text-decoration: none; font-size: 10px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">
                    Buy Now
                </a>
            </td>
        </tr>
    `).join("");

    return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8" /></head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0A0A0C; border: 1px solid rgba(255,255,255,0.1); padding: 40px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 14px; letter-spacing: 0.2em; font-weight: bold; margin: 0;">AETHELON GENEVE</h1>
                </div>
                
                <h2 style="font-size: 24px; font-weight: 300; margin-bottom: 16px;">
                    Price Drop Alert
                </h2>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6; margin-bottom: 32px;">
                    Good news, ${customerName}. Some items you've agreed are now available for less.
                </p>
                
                <table style="width: 100%; border-collapse: collapse;">${productRows}</table>
                
                <div style="margin-top: 32px; text-align: center;">
                    <a href="https://aethelon.geneve.com/account/wishlist" 
                       style="display: inline-block; padding: 14px 32px; background: #fff; color: #000; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase;">
                        View Wishlist
                    </a>
                </div>
            </div>
        </body>
        </html>
    `;
}
