"use server";

import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { TestResult } from "@/lib/interfaces";
import { stripe } from "@/lib/stripe";
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "@/lib/logger";

async function wrapTest(name: string, id: string, fn: () => Promise<any>): Promise<TestResult> {
    const start = Date.now();
    try {
        await fn();
        return {
            id,
            name,
            status: "success",
            message: "Operational",
            duration: Date.now() - start,
            details: { lastChecked: new Date().toISOString() }
        };
    } catch (error: any) {
        logger.error({ err: error }, `Diagnostic Failed: ${name}`);
        return {
            id,
            name,
            status: "failure",
            message: error.message || "Connection failed",
            duration: Date.now() - start
        };
    }
}

export async function testDatabase(): Promise<TestResult> {
    await requireAdmin();
    return wrapTest("Database", "db", async () => {
        await prisma.$queryRaw`SELECT 1`;
    });
}

export async function testAuth(): Promise<TestResult> {
    await requireAdmin();
    return wrapTest("Auth (Kinde)", "auth", async () => {
        if (!process.env.KINDE_SITE_URL || !process.env.KINDE_ISSUER_URL) {
            throw new Error("Kinde environment variables missing");
        }
    });
}

export async function testStripe(): Promise<TestResult> {
    await requireAdmin();
    return wrapTest("Stripe", "stripe", async () => {
        if (!stripe) throw new Error("Stripe not initialized");
        await stripe.balance.retrieve();
    });
}

export async function testResend(): Promise<TestResult> {
    await requireAdmin();
    return wrapTest("Resend Email", "resend", async () => {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY missing");
        }
    });
}

export async function testGemini(): Promise<TestResult> {
    await requireAdmin();
    return wrapTest("Gemini AI", "gemini", async () => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY missing");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // Minimal token use check
        await model.countTokens("ping");
    });
}

export async function testMeshy(): Promise<TestResult> {
    await requireAdmin();
    return wrapTest("Meshy (3D)", "meshy", async () => {
        if (!process.env.MESHY_API_KEY) {
            throw new Error("MESHY_API_KEY missing");
        }
    });
}

export async function testReplicate(): Promise<TestResult> {
    await requireAdmin();
    return wrapTest("Replicate (AI)", "replicate", async () => {
        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error("REPLICATE_API_TOKEN missing");
        }
    });
}

export async function testShippo(): Promise<TestResult> {
    await requireAdmin();
    return wrapTest("Shippo", "shippo", async () => {
        if (!process.env.SHIPPO_API_KEY) {
            throw new Error("SHIPPO_API_KEY missing");
        }
    });
}

export async function testUploadThing(): Promise<TestResult> {
    await requireAdmin();
    return wrapTest("UploadThing", "uploadthing", async () => {
        if (!process.env.UPLOADTHING_SECRET || !process.env.UPLOADTHING_APP_ID) {
            throw new Error("UploadThing variables missing");
        }
    });
}
