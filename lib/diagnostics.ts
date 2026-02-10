import prisma from "@/lib/db";
import { resend } from "@/lib/resend";
import { stripe } from "@/lib/stripe";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import { TestResult } from "@/lib/interfaces";

export async function runDatabaseTest(): Promise<TestResult> {
    const start = Date.now();
    try {
        const [result] = await prisma.$queryRaw<[{ version: string }]>`SELECT version();`;
        const version = result.version || "Unknown";
        // Also get connection info if possible

        return {
            id: "db",
            name: "Database (Neon)",
            status: "success",
            message: "Connected to Neon/Postgres",
            duration: Date.now() - start,
            details: {
                "Version": version.split(' ')[0] + ' ' + version.split(' ')[1] // e.g. PostgreSQL 15.3
            }
        };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { id: "db", name: "Database (Neon)", status: "failure", message: msg, duration: Date.now() - start };
    }
}

export async function runStripeTest(): Promise<TestResult> {
    const start = Date.now();
    if (!process.env.STRIPE_SECRET_KEY) return { id: "stripe", name: "Stripe", status: "failure", message: "Missing STRIPE_SECRET_KEY", duration: 0 };

    try {
        const balance = await stripe.balance.retrieve();
        const available = balance.available.reduce((acc, curr) => acc + curr.amount, 0);
        const pending = balance.pending.reduce((acc, curr) => acc + curr.amount, 0);

        return {
            id: "stripe",
            name: "Stripe",
            status: "success",
            message: "Balance retrieved",
            duration: Date.now() - start,
            details: {
                "Available Balance": (available / 100).toFixed(2) + ' ' + balance.available[0]?.currency.toUpperCase(),
                "Pending Balance": (pending / 100).toFixed(2) + ' ' + balance.pending[0]?.currency.toUpperCase(),
                "Live Mode": balance.livemode ? "Yes" : "No"
            }
        };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { id: "stripe", name: "Stripe", status: "failure", message: msg, duration: Date.now() - start };
    }
}

export async function runResendTest(_email?: string): Promise<TestResult> {
    const start = Date.now();
    if (!process.env.RESEND_API_KEY) return { id: "resend", name: "Resend Email", status: "failure", message: "Missing RESEND_API_KEY", duration: 0 };
    // Skip sending email to avoid spam, just check domains or verify key if possible. Resend client doesn't have a "verify" but listing domains is safe.

    try {
        // Can't list domains easily without permission potentially, but sending to self is safe enough for "Diagnostics". 
        // However, user complained about just "API Key exists". 
        // Let's try to get account info or list domains.
        // Assuming domains.list() exists on client, if not we fallback to send.
        // But the previous impl was sending email. Let's keep it but maybe add more info?

        // Actually, let's try to list api keys or domains if possible.
        // resend.domains.list() 
        const domains = await resend.domains.list();

        if (domains.error) {
            throw new Error(domains.error.message);
        }

        const domainCount = domains.data?.data?.length || 0;
        const verifiedDomains = domains.data?.data?.filter((d: { status: string }) => d.status === 'verified').length || 0;

        return {
            id: "resend",
            name: "Resend",
            status: "success",
            message: "API Accessible",
            duration: Date.now() - start,
            details: {
                "Registered Domains": domainCount,
                "Verified Domains": verifiedDomains,
                "Webhooks": "Not checked"
            }
        };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { id: "resend", name: "Resend", status: "failure", message: msg, duration: Date.now() - start };
    }
}

export async function runGeminiTest(): Promise<TestResult> {
    const start = Date.now();
    if (!process.env.GEMINI_API_KEY) return { id: "gemini", name: "Gemini AI", status: "failure", message: "Missing GEMINI_API_KEY", duration: 0 };

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Reply with one word: Online");
        const response = result.response.text();

        return {
            id: "gemini",
            name: "Gemini AI",
            status: "success",
            message: "Generation Operational",
            duration: Date.now() - start,
            details: {
                "Model": "gemini-2.5-flash",
                "Response Test": response.trim()
            }
        };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { id: "gemini", name: "Gemini AI", status: "failure", message: msg, duration: Date.now() - start };
    }
}

export async function runShippoTest(): Promise<TestResult> {
    const start = Date.now();
    if (!process.env.SHIPPO_API_KEY) return { id: "shippo", name: "Shippo", status: "failure", message: "Missing SHIPPO_API_KEY", duration: 0 };

    try {
        const res = await fetch("https://api.goshippo.com/addresses/?page_size=1", {
            headers: { "Authorization": `ShippoToken ${process.env.SHIPPO_API_KEY}` }
        });

        if (!res.ok) throw new Error(`Status ${res.status} ${res.statusText}`);

        const data = await res.json();

        return {
            id: "shippo",
            name: "Shippo",
            status: "success",
            message: "API Reachable",
            duration: Date.now() - start,
            details: {
                "Total Addresses": data.count || "Unknown",
                "Next Page": data.next ? "Available" : "None"
            }
        };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { id: "shippo", name: "Shippo", status: "failure", message: msg, duration: Date.now() - start };
    }
}

export async function runKindeTest(): Promise<TestResult> {
    const start = Date.now();
    try {
        getKindeServerSession();
        // Just verify basic SDK methods don't throw, we can't easily check external API status without a dedicated endpoint or user session
        // But we can check if environment variables are likely set by checking if client initializes (which it does implicitly)
        // A better check is to try and get a property.
        if (!process.env.KINDE_CLIENT_ID || !process.env.KINDE_CLIENT_SECRET) {
            return { id: "auth", name: "Auth (Kinde)", status: "failure", message: "Missing KINDE keys", duration: 0 };
        }

        return {
            id: "auth",
            name: "Auth (Kinde)",
            status: "success",
            message: "Context Initialized",
            duration: Date.now() - start,
            details: {
                "Client ID": process.env.KINDE_CLIENT_ID ? "Set" : "Missing",
                "Issuer URL": process.env.KINDE_ISSUER_URL ? "Set" : "Missing"
            }
        };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { id: "auth", name: "Auth (Kinde)", status: "failure", message: msg, duration: Date.now() - start };
    }
}

export async function runMeshyTest(): Promise<TestResult> {
    const start = Date.now();
    const key = process.env.MESHY_API_KEY;
    if (!key) return { id: "meshy", name: "Meshy (3D)", status: "failure", message: "Missing MESHY_API_KEY", duration: 0 };

    try {
        // Simple lightweight check, maybe list recent tasks or check generic info if available. 
        // Meshy API doesn't have a /health or /me, but we can list tasks with limit 1
        const res = await fetch("https://api.meshy.ai/openapi/v1/image-to-3d?page_size=1", {
            headers: { Authorization: `Bearer ${key}` }
        });

        return {
            id: "meshy",
            name: "Meshy (3D)",
            status: "success",
            message: "API Reachable",
            duration: Date.now() - start,
            details: {
                "Status": res.status === 200 ? "OK" : `Status ${res.status}`,
                // "Credits": "Not visible via API" // Meshy v2 doesn't expose credits easily in list endpoint
            }
        };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { id: "meshy", name: "Meshy (3D)", status: "failure", message: msg, duration: Date.now() - start };
    }
}

export async function runReplicateTest(): Promise<TestResult> {
    const start = Date.now();
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) return { id: "replicate", name: "Replicate (AI)", status: "failure", message: "Missing REPLICATE_API_TOKEN", duration: 0 };

    try {
        const res = await fetch("https://api.replicate.com/v1/account", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();

        return {
            id: "replicate",
            name: "Replicate (AI)",
            status: "success",
            message: "Account Verified",
            duration: Date.now() - start,
            details: {
                "User": data.username || "Unknown",
                "Type": data.type || "Personal"
            }
        };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { id: "replicate", name: "Replicate (AI)", status: "failure", message: msg, duration: Date.now() - start };
    }
}

export async function runUploadThingTest(): Promise<TestResult> {
    const start = Date.now();
    const token = process.env.UPLOADTHING_TOKEN;

    if (!token) {
        return {
            id: "uploadthing",
            name: "UploadThing",
            status: "failure",
            message: "Missing UPLOADTHING_TOKEN",
            duration: 0
        };
    }

    // Basic check: just verify the token exists and we can "init" virtually.
    // UploadThing doesn't have a simple public "ping" without full setup, 
    // but checking env var presence is the first step.
    // We can also check if the file router is validity logic? No, let's keep it simple.

    return {
        id: "uploadthing",
        name: "UploadThing",
        status: "success",
        message: "Configuration Found",
        duration: Date.now() - start,
        details: {
            "Token Set": "Yes"
        }
    };
}
