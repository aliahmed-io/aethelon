"use server";

import prisma from "@/lib/db";

// Define interfaces for the data we expect from Prisma
interface WishlistProduct {
    id: string;
    name: string;
    stockQuantity: number;
    images: string[];
    price: number;
}

interface WishlistUser {
    email: string;
    firstName: string | null;
}

// Interface for the fetched item structure including relations
interface WishlistItemWithRelations {
    id: string;
    userId: string;
    productId: string;
    user: WishlistUser;
    product: WishlistProduct;
}

interface LowStockProduct {
    id: string;
    name: string;
    stockQuantity: number;
    image: string;
}

/**
 * Get low stock products in user wishlists for alert processing
 */
export async function getLowStockWishlistData() {
    const LOW_STOCK_THRESHOLD = 5;

    // Use a raw fetch or rigorous casting to ensure types
    const rawItems = await prisma.wishlistItem.findMany({
        where: {
            product: {
                stockQuantity: { lte: LOW_STOCK_THRESHOLD, gt: 0 },
                status: "published"
            }
        },
        include: {
            user: {
                select: { email: true, firstName: true }
            },
            product: {
                select: { id: true, name: true, stockQuantity: true, images: true, price: true }
            }
        }
    });

    // Cast the result to our expected type
    const lowStockItems = rawItems as unknown as WishlistItemWithRelations[];

    // Group by user
    const userAlerts: Record<string, {
        email: string;
        name: string;
        products: LowStockProduct[]
    }> = {};

    for (const item of lowStockItems) {
        const userId = item.userId;

        // Ensure relations exist before accessing
        if (!item.user || !item.product) continue;

        if (!userAlerts[userId]) {
            userAlerts[userId] = {
                email: item.user.email,
                name: item.user.firstName || "Valued Customer",
                products: []
            };
        }

        userAlerts[userId].products.push({
            id: item.product.id,
            name: item.product.name,
            stockQuantity: item.product.stockQuantity,
            image: item.product.images[0] || ""
        });
    }

    return Object.entries(userAlerts).map(([userId, data]) => ({
        userId,
        ...data
    }));
}

/**
 * Generate email HTML for low stock notification
 */
export function generateLowStockEmailHtml(customerName: string, products: LowStockProduct[]): string {
    const productRows = products.map(p => `
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 16px;">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="${p.image}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover;" />
                    <div>
                        <p style="margin: 0; font-size: 14px; font-weight: 500;">${p.name}</p>
                        <p style="margin: 4px 0 0; font-size: 12px; color: #ef4444;">Only ${p.stockQuantity} left!</p>
                    </div>
                </div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right;">
                <a href="https://aethelon.geneve.com/shop/${p.id}" 
                   style="display: inline-block; padding: 8px 16px; background: #fff; color: #000; text-decoration: none; font-size: 10px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">
                    View
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
                    Items in Your Wishlist Are Selling Fast
                </h2>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6; margin-bottom: 32px;">
                    Dear ${customerName}, the following items from your wishlist are running low on stock.
                </p>
                
                <table style="width: 100%; border-collapse: collapse;">${productRows}</table>
                
                <div style="margin-top: 32px; text-align: center;">
                    <a href="https://aethelon.geneve.com/account/wishlist" 
                       style="display: inline-block; padding: 14px 32px; background: #fff; color: #000; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase;">
                        View Wishlist
                    </a>
                </div>
                
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; margin-top: 32px; text-align: center;">
                    <p style="font-size: 10px; color: rgba(255,255,255,0.3);">
                        You're receiving this because you opted in to wishlist notifications.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
}

/**
 * Get low stock items from a user's wishlist
 */
export async function getLowStockWishlistItems(userId: string) {
    const LOW_STOCK_THRESHOLD = 5;

    const rawItems = await prisma.wishlistItem.findMany({
        where: {
            userId,
            product: {
                stockQuantity: { lte: LOW_STOCK_THRESHOLD, gt: 0 },
                status: "published"
            }
        },
        include: {
            product: {
                select: { id: true, name: true, stockQuantity: true, images: true, price: true }
            }
        }
    });

    const items = rawItems as unknown as { product: WishlistProduct }[];

    return items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        stockQuantity: item.product.stockQuantity,
        image: item.product.images[0] || "",
        price: item.product.price
    }));
}
