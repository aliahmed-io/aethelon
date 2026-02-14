"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
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

export async function checkOut(formData: FormData) {
    const user = await requireUser();

    // Parse Address from FormData
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const street1 = formData.get("street1") as string;
    const street2 = formData.get("street2") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const postalCode = formData.get("postalCode") as string;
    const country = formData.get("country") as string || "US";
    const phone = formData.get("phone") as string;

    const shippingAddress = {
        name: `${firstName} ${lastName}`.trim(),
        street1,
        street2,
        city,
        state,
        postalCode,
        country,
        phone
    };

    // Simple validation (Consider using Zod)
    if (!firstName || !street1 || !city || !state || !postalCode) {
        // Since this is a server action called by a form, we can't easily return UI errors without `useFormState`.
        // Ideally we redirect with error, OR rely on client-side `required` attributes for basic checking,
        // but robust apps need server validation. 
        // For now, we redirect with error query param.
        return redirect("/checkout?error=Missing required shipping fields");
    }

    // Rate Limit: 5 checkouts per minute per user (prevent inventory locking attacks)
    const { success } = await rateLimit(`checkout-${user.id}`, 5, "60 s");
    if (!success) {
        return redirect("/bag?error=Too many requests. Please try again later.");
    }

    let cart: Cart | null = null;

    if (redis) {
        const cartData = await redis.get(`cart-${user.id}`);
        if (cartData) {
            // Safely parse JSON
            try {
                cart = typeof cartData === 'string' ? JSON.parse(cartData) as Cart : cartData as Cart;
            } catch (e) {
                logger.error(e, "Failed to parse cart JSON during checkout");
                cart = null; // Reset cart on error
            }
        }
    }

    if (cart && cart.items && cart.items.length > 0) {
        // 1. Create Order with Address
        const order = await OrderService.createFromCart(user.id, cart, shippingAddress);

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
        const session = await PaymentService.createCheckoutSession(order, cart.items, user.email ?? undefined);

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

export async function bulkDeleteProducts(ids: string[]) {
    await requireAdmin();

    await prisma.product.deleteMany({
        where: {
            id: { in: ids }
        }
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/store/dashboard/products");
}

type BulkProductUpdate = {
    id: string;
    status?: import("@prisma/client").ProductStatus;
    price?: number;
    isFeatured?: boolean;
    discountPercentage?: number;
    categoryId?: string;
    mainCategory?: import("@prisma/client").MainCategory | null;
    modelUrl?: string | null;
    usdzUrl?: string | null;
};

export async function bulkUpdateProducts(updates: BulkProductUpdate[]) {
    await requireAdmin();

    const transactions = updates.map((update) => {
        const {
            id,
            status,
            price,
            isFeatured,
            discountPercentage,
            categoryId,
            mainCategory,
            modelUrl,
            usdzUrl,
        } = update;

        const data: import("@prisma/client").Prisma.ProductUpdateInput = {
            ...(status !== undefined ? { status } : {}),
            ...(price !== undefined ? { price } : {}),
            ...(isFeatured !== undefined ? { isFeatured } : {}),
            ...(discountPercentage !== undefined ? { discountPercentage } : {}),
            ...(categoryId !== undefined ? { category: { connect: { id: categoryId } } } : {}),
            ...(mainCategory !== undefined && mainCategory !== null ? { mainCategory } : {}),
            ...(modelUrl !== undefined ? { modelUrl } : {}),
            ...(usdzUrl !== undefined ? { usdzUrl } : {}),
        };

        return prisma.product.update({
            where: { id },
            data
        });
    });

    await prisma.$transaction(transactions);

    revalidatePath("/dashboard/products");
    revalidatePath("/store/dashboard/products");
}

export async function applyDiscount(formData: FormData) {
    const code = formData.get("code") as string;
    if (!code) return { error: "Discount code is required" };

    try {
        const discount = await prisma.discount.findUnique({
            where: { code },
        });

        if (!discount || !discount.isActive) {
            return { error: "Invalid or inactive discount code" };
        }

        if (discount.expiresAt && discount.expiresAt < new Date()) {
            return { error: "Discount code has expired" };
        }

        const cookieStore = await cookies();
        cookieStore.set("discountCode", code, {
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        revalidatePath("/bag");
        revalidatePath("/checkout");
        return { success: true, percentage: discount.percentage };
    } catch (error) {
        console.error("Apply Discount Error:", error);
        return { error: "Failed to apply discount" };
    }
}

export async function removeDiscount() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete({
            name: "discountCode",
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
        revalidatePath("/bag");
        revalidatePath("/checkout");
        return { success: true };
    } catch (error) {
        console.error("Remove Discount Error:", error);
        return { error: "Failed to remove discount" };
    }
}

