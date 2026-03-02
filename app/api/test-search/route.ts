import { NextResponse } from "next/server";
import { searchProductsHybrid } from "@/lib/search/hybrid";

export const dynamic = 'force-dynamic';

export async function GET() {
    const results = await searchProductsHybrid({
        query: "a comfortable chair for reading",
        limit: 5
    });
    return NextResponse.json({ results });
}
