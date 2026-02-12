"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { redis } from "@/lib/redis";
import { Cart } from "@/lib/interfaces";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { parseWithZod } from "@conform-to/zod";
import { reviewSchema } from "@/lib/zodSchemas";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAdmin, requireUser } from "@/lib/auth";
import { CircuitBreaker } from "@/lib/circuit-breaker";

import { InventoryService } from "@/lib/inventory";
import logger from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

const geminiBreaker = new CircuitBreaker("Gemini-AI", { failureThreshold: 3, recoveryTimeout: 30000 });
const meshyBreaker = new CircuitBreaker("Meshy-3D", { failureThreshold: 3, recoveryTimeout: 60000 });

export async function checkOut() {
    const user = await requireUser();

    // Rate Limit: 5 checkouts per minute per user (prevent inventory locking attacks)
    const { success } = await rateLimit(`checkout-${user.id}`, 5, "60 s");
    if (!success) {
        return redirect("/bag?error=Too many requests. Please try again later.");
    }

    let cart: Cart | null = null;

    if (redis) {
        const cartData = await redis.get(`cart-${user.id}`);
        if (cartData) {
            cart = JSON.parse(cartData) as Cart;
        }
    }

    if (cart && cart.items && cart.items.length > 0) {
        // 1. Create Order (CREATED state)
        // We create it first so we have an ID for reservation and Stripe metadata
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                amount: cart.items.reduce((total, item) => total + item.price * item.quantity, 0) * 100, // Amount in cents
                status: "CREATED",
                paymentStatus: "PENDING",
                orderItems: {
                    create: cart.items.map((item) => ({
                        productId: item.id,
                        name: item.name,
                        price: Math.round(item.price * 100), // Store in cents
                        quantity: item.quantity,
                        image: item.imageString,
                    })),
                },
            },
        });

        // 2. Reserve Stock
        try {
            await InventoryService.reserveStock(
                order.id,
                cart.items.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                }))
            );
        } catch (error: any) {
            logger.error("Reservation Failed", error);
            // Cancel order if reservation fails
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "CANCELLED" },
            });
            // return redirect(`/bag?error=${encodeURIComponent(error.message)}`);
            // Server actions redirect limitation: needs to be caught in UI or just redirect
            return redirect("/bag?error=Out of Stock");
        }

        // 3. Create Stripe Session
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map(
            (item) => ({
                price_data: {
                    currency: "usd",
                    unit_amount: Math.round(item.price * 100),
                    product_data: {
                        name: item.name,
                        images: [item.imageString],
                    },
                },
                quantity: item.quantity,
            })
        );

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: lineItems,
            success_url: process.env.NEXT_PUBLIC_URL + "/checkout/success",
            cancel_url: process.env.NEXT_PUBLIC_URL + "/checkout/cancel",
            metadata: {
                userId: user.id,
                orderId: order.id, // Pass Order ID to Webhook
            },
        });

        return redirect(session.url as string);
    }

    return redirect("/bag");
}

export async function delItem(formData: FormData) {
    const user = await requireUser();

    const productId = formData.get("productId");

    let cart: Cart | null = null;

    if (redis) {
        const cartData = await redis.get(`cart-${user.id}`);
        if (cartData) {
            cart = JSON.parse(cartData) as Cart;
        }
    }

    if (cart && cart.items) {
        const updateCart: Cart = {
            userId: user.id,
            items: cart.items.filter((item) => item.id !== productId),
            discountCode: cart.discountCode,
            discountPercentage: cart.discountPercentage,
        };

        if (redis) {
            await redis.set(`cart-${user.id}`, JSON.stringify(updateCart));
        }
    }

    revalidatePath("/bag");
    revalidateTag("products");
}

export async function createProduct(_prevState: unknown, formData: FormData) {
    const user = await requireAdmin();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const images = formData.get("images") as string;
    const imageArray = images ? images.split(",") : [];

    const categoryId = formData.get("category") as string;
    const status = formData.get("status") as "draft" | "published" | "archived";


    const isFeatured = formData.get("isFeatured") === "on";

    // Rate Limit: 20 creations per min (Admin)
    const { success } = await rateLimit(`create-product-${user.id}`, 20, "60 s");
    if (!success) {
        return redirect("/dashboard/products?error=Rate limit exceeded");
    }

    await prisma.product.create({
        data: {
            name,
            description,
            price,
            images: imageArray,
            categoryId,
            status,
            isFeatured,
            costPrice: Number(formData.get("costPrice") || 0),
        },
    });

    revalidateTag("products");
    return redirect("/dashboard/products");
}

export async function editProduct(_prevState: unknown, formData: FormData) {
    const user = await requireAdmin();

    const productId = formData.get("productId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const images = formData.get("images") as string;
    const imageArray = images ? images.split(",") : [];
    const categoryId = formData.get("category") as string;
    const status = formData.get("status") as "draft" | "published" | "archived";


    const isFeatured = formData.get("isFeatured") === "on";

    // Rate Limit: 20 edits per min (Admin)
    const { success } = await rateLimit(`edit-product-${user.id}`, 20, "60 s");
    if (!success) {
        return redirect("/dashboard/products?error=Rate limit exceeded");
    }

    await prisma.product.update({
        where: {
            id: productId,
        },
        data: {
            name,
            description,
            price,
            images: imageArray,
            categoryId,
            status,
            isFeatured,
            costPrice: Number(formData.get("costPrice") || 0),
        },
    });

    return redirect("/dashboard/products");
}

export async function createCategory(_prevState: unknown, formData: FormData) {
    const user = await requireAdmin();

    await prisma.category.create({
        data: {
            name: formData.get("name") as string,
            slug: (formData.get("name") as string).toLowerCase().replace(/ /g, "-"),
            description: formData.get("description") as string,
        },
    });

    return redirect("/dashboard/categories");
}

export async function createCampaign(_prevState: unknown, formData: FormData) {
    const user = await requireAdmin();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageString = formData.get("imageString") as string;
    // Handle multi-select for products if passed as comma-separated or multiple fields?
    // Usually formData.getAll("products") if checkboxes.
    // Assuming we might pass a JSON string or handle it differently in the form.
    // For simplicity, let's assume "selectedProducts" is a JSON string of IDs
    const selectedProducts = formData.get("selectedProducts") as string;
    const productIds = selectedProducts ? JSON.parse(selectedProducts) : [];

    await prisma.campaign.create({
        data: {
            title,
            slug: title.toLowerCase().replace(/ /g, "-"),
            description,
            heroImage: imageString,
            products: {
                connect: productIds.map((id: string) => ({ id }))
            }
        }
    });

    return redirect("/dashboard/campaigns");
}

export async function createBanner(_prevState: unknown, formData: FormData) {
    const user = await requireAdmin();

    const campaignId = formData.get("campaignId") as string;
    let link = formData.get("link") as string;

    if (campaignId) {
        const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
        if (campaign) {
            link = `/campaigns/${campaign.slug}`;
        }
    }

    await prisma.banner.create({
        data: {
            title: formData.get("title") as string,
            imageString: formData.get("imageString") as string,
            link: link || "/",
            campaignId: campaignId || null,
        },
    });

    return redirect("/dashboard/banner");
}

export async function createReview(_prevState: unknown, formData: FormData) {
    const user = await requireUser();

    const parse = parseWithZod(formData, {
        schema: reviewSchema,
    });

    if (parse.status !== "success") {
        return parse.reply();
    }



    // Rate Limit: 3 reviews per minute
    const { success } = await rateLimit(`review-${user.id}`, 3, "60 s");
    if (!success) {
        return { status: "error", message: "You are posting reviews too quickly." };
    }

    await prisma.review.create({
        data: {
            rating: parse.value.rating,
            comment: parse.value.comment,
            productId: formData.get("productId") as string,
            userId: user.id,
        },
    });

    revalidatePath(`/shop/${formData.get("productId")}`);
    return { status: "success", message: "Review posted successfully!" };
}

export async function chatWithBusinessAdvisor(history: { role: string; message?: string; text?: string }[], userMessage: string) {
    const user = await requireUser();

    // Authorization: Ideally only Admin or "Premium" users. 
    // For now, allow authenticated users but rate limited.
    // If strict admin only: await requireAdmin();

    // Rate Limit: 10 messages per minute (Cost Control)
    const { success: limitSuccess } = await rateLimit(`ai-advisor-${user.id}`, 10, "60 s");
    if (!limitSuccess) {
        return { success: false, message: "You have reached the message limit. Please wait a moment." };
    }

    try {
        const [revenue, orderCount, productCount, recentOrders] = await Promise.all([
            prisma.order.aggregate({ _sum: { amount: true } }),
            prisma.order.count(),
            prisma.product.count(),
            prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { amount: true } })
        ]);

        const context = `
            Current Business Snapshot:
            - Total Revenue: $${(revenue._sum.amount || 0) / 100}
            - Total Orders: ${orderCount}
            - Total Products: ${productCount}
            - Latest Order Value: $${(recentOrders[0]?.amount || 0) / 100}
        `;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
        const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{
                        text: `You are an AI Business Advisor for Aethelon, a luxury watch store. 
                    Be concise, professional, and strategic. 
                    Here is the live data: ${context}`
                    }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to advise on Aethelon's operations." }],
                },
                ...history.map((msg) => ({
                    role: msg.role === "admin" ? "user" : "model",
                    parts: [{ text: msg.message || msg.text || "" }],
                })),
            ],
        });

        const response = await geminiBreaker.execute(async () => {
            const result = await chat.sendMessage(userMessage);
            return result.response.text();
        });

        return { success: true, response };
    } catch (error: any) {
        logger.error("AI Advisor Error", error);
        return { success: false, message: error.message || "Failed to consult advisor." };
    }
}

export async function getDailyRevenue() {
    await requireAdmin();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const data = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: sevenDaysAgo
            }
        },
        select: {
            amount: true,
            createdAt: true
        }
    });

    const dailyRevenue: Record<string, number> = {};

    data.forEach((order: any) => {
        const date = order.createdAt.toLocaleDateString();
        if (dailyRevenue[date]) {
            dailyRevenue[date] += order.amount / 100;
        } else {
            dailyRevenue[date] = order.amount / 100;
        }
    });

    const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
        date,
        revenue
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return chartData;
}

export async function generate3DModel(productId: string, imageUrls: string[]) {
    await requireAdmin();
    return meshyBreaker.execute(async () => {
        // Real implementation would go here
        return { success: true };
    });
}

export async function delete3DModel(productId: string) {
    await requireAdmin();
    return { success: true };
}

export async function checkMeshyStatus(productId: string) {
    return { status: "SUCCEEDED", progress: 100 };
}

export async function updateProductModel(productId: string, modelUrl: string) {
    await requireAdmin();
    return { success: true };
}

export async function cancel3DModelGeneration(productId: string) {
    await requireAdmin();
    return { success: true };
}
