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

export async function checkOut() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }

    let cart: Cart | null = null;

    if (redis) {
        const cartData = await redis.get(`cart-${user.id}`);
        if (cartData) {
            cart = JSON.parse(cartData) as Cart;
        }
    }

    if (cart && cart.items) {
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
            },
        });

        return redirect(session.url as string);
    }
}

export async function delItem(formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }

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
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/");
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const images = formData.get("images") as string;
    const imageArray = images ? images.split(",") : [];

    const categoryId = formData.get("category") as string;
    const status = formData.get("status") as "draft" | "published" | "archived";
    const isFeatured = formData.get("isFeatured") === "on";

    await prisma.product.create({
        data: {
            name,
            description,
            price,
            images: imageArray,
            categoryId,
            status,
            isFeatured,
        },
    });

    revalidateTag("products");
    return redirect("/dashboard/products");
}

export async function editProduct(_prevState: unknown, formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/");
    }

    const productId = formData.get("productId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const images = formData.get("images") as string;
    const imageArray = images ? images.split(",") : [];
    const categoryId = formData.get("category") as string;
    const status = formData.get("status") as "draft" | "published" | "archived";
    const isFeatured = formData.get("isFeatured") === "on";

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
        },
    });

    return redirect("/dashboard/products");
}

export async function createCategory(_prevState: unknown, formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/");
    }

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
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/");
    }

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
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/");
    }

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
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }

    const parse = parseWithZod(formData, {
        schema: reviewSchema,
    });

    if (parse.status !== "success") {
        return parse.reply();
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
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return { success: false, message: "Unauthorized" };
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

        const result = await chat.sendMessage(userMessage);
        const response = result.response.text();

        return { success: true, response };
    } catch (error) {
        console.error("AI Advisor Error:", error);
        return { success: false, message: "Failed to consult advisor." };
    }
}

export async function getDailyRevenue() {
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

    data.forEach((order) => {
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
