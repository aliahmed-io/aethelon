import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkModelQuality } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Meshy sends different payload formats depending on the event version or specific API
        // We handle multiple variations here for robustness
        const id = (body as any).id ?? (body as any).task_id ?? (body as any).taskId ?? (body as any).result;
        const status = (body as any).status ?? (body as any).task_status;
        const model_urls = (body as any).model_urls ?? (body as any).modelUrls;
        const thumbnail_url = (body as any).thumbnail_url ?? (body as any).thumbnailUrl;
        const progress = (body as any).progress;

        if (!id) {
            return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
        }

        // Find product by meshyTaskId
        const product = await prisma.product.findFirst({
            where: {
                meshyTaskId: id,
            },
        });

        if (!product) {
            // It's possible we get a callback for a task that isn't linked to a product yet 
            // or was deleted. We log it but return 404.
            console.warn(`Meshy webhook received for unknown task ID: ${id}`);
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (status === "SUCCEEDED") {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    meshyStatus: "SUCCEEDED",
                    meshyProgress: 100,
                    modelUrl: model_urls?.glb, // Save the GLB model URL
                },
            });

            // Trigger Gemini QA check if we have a thumbnail
            // This runs asynchronously and doesn't block the webhook response
            if (thumbnail_url) {
                // We wrap this in a non-awaiting promise or just fire-and-forget 
                // but Next.js serverless functions might terminate if we don't await.
                // ideally use a background job, but for now we'll await it quickly or accept the latency.
                // QA is fast enough.
                const qaResult = await checkModelQuality(thumbnail_url);

                if (qaResult) {
                    console.log(`Gemini QA for Product ${product.id}:`, qaResult);
                    // Optionally save this to a new field in the future
                }
            }

        } else if (status === "FAILED") {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    meshyStatus: "FAILED",
                    meshyProgress: progress || 0,
                },
            });
        } else if (status === "IN_PROGRESS") {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    meshyStatus: "IN_PROGRESS",
                    meshyProgress: progress || 0,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Meshy Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
