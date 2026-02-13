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
import { CircuitBreaker } from "@/modules/observability/circuit-breaker";

import { InventoryService } from "@/modules/inventory/inventory.service";
import { OrderService } from "@/modules/orders/orders.service";
import { PaymentService } from "@/modules/payments/payments.service";
import logger from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

const geminiBreaker = new CircuitBreaker("Gemini-AI", { failureThreshold: 3, recoveryTimeout: 30000 });
const meshyBreaker = new CircuitBreaker("Meshy-3D", { failureThreshold: 3, recoveryTimeout: 60000 });

// Re-implement addItem
export async function addItem(productId: string, formData: FormData) {
    const user = await requireUser();

    // Parse quantity and color from formData
    const quantity = Number(formData.get("quantity") || 1);
    const color = formData.get("color") as string;
    const size = formData.get("size") as string;

    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, price: true, images: true, stockQuantity: true }
    });

    if (!product) throw new Error("Product not found");

    if (product.stockQuantity < quantity) {
        throw new Error("Insufficient stock");
    }

    let cart: Cart | null = null;
    if (redis) {
        const cartData = await redis.get(`cart-${user.id}`);
        if (cartData) {
            cart = JSON.parse(cartData) as Cart;
        }
    }

    if (!cart) {
        cart = {
            userId: user.id,
            items: [],
        };
    }

    const existingItemIndex = cart.items.findIndex(
        (item) => item.id === productId && item.color === color && item.size === size
    );

    if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        cart.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            imageString: product.images[0],
            color: color, // Optional, check CartItem interface
            size: size // Optional
        });
    }

    if (redis) {
        await redis.set(`cart-${user.id}`, JSON.stringify(cart));
    }

    revalidatePath("/bag");
}

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
        // 1. Create Order
        const order = await OrderService.createFromCart(user.id, cart);

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
            await OrderService.cancelOrder(order.id);
            return redirect("/bag?error=Out of Stock");
        }

        // 3. Create Stripe Session
        const session = await PaymentService.createCheckoutSession(order, cart.items);

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
    // @ts-ignore
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

    // @ts-ignore
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
                        text: `You are an AI Business Advisor for Aethelon, a luxury furniture brand. 
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

export async function loadMoreProducts({
    offset = 0,
    limit = 10,
    category,
    sort,
    price,
    color,
    size,
}: {
    offset?: number;
    limit?: number;
    category?: string;
    sort?: string;
    price?: string;
    color?: string;
    size?: string;
}) {
    const where: any = {
        status: "published",
    };

    if (category && category !== "all") {
        where.category = { slug: category };
    }

    if (color) {
        where.color = color;
    }

    if (size) {
        where.sizes = { has: size };
    }

    if (price) {
        const [min, max] = price.split("-").map(Number);
        if (max) {
            where.price = { gte: min * 100, lte: max * 100 };
        } else {
            where.price = { gte: min * 100 };
        }
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") {
        orderBy = { price: "asc" };
    } else if (sort === "price-desc") {
        orderBy = { price: "desc" };
    }

    const products = await prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy,
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            images: true,
            discountPercentage: true,
            modelUrl: true,
        },
    });

    return products.map((p) => ({
        ...p,
        price: p.price / 100,
    }));
}
