import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        // 1. Delete all variants that aren't the cloud modular sofa
        const allProducts = await prisma.product.findMany();
        for (const p of allProducts) {
            if (p.name !== "Cloud Modular Sofa") {
                await prisma.productVariant.deleteMany({ where: { productId: p.id } });
            }
        }

        // 2. Insert the Lumina Accent Chair
        await prisma.product.create({
            data: {
                name: "Lumina Accent Chair",
                description: "A modern velvet accent chair with a minimalist design.",
                status: "published",
                price: 49900,
                images: ["/variants/emerald_chair_1.png", "/variants/emerald_chair_2.png", "/variants/emerald_chair_3.png"],
                stockQuantity: 50,
                color: "Emerald",
                style: "Modern",
                variants: {
                    create: [
                        { colorName: "Emerald", colorHex: "#50C878", images: ["/variants/emerald_chair_1.png", "/variants/emerald_chair_2.png", "/variants/emerald_chair_3.png"] },
                        { colorName: "Ochre", colorHex: "#CC7722", images: ["/variants/ochre_chair_1.png", "/variants/ochre_chair_2.png", "/variants/ochre_chair_3.png"] }
                    ]
                }
            }
        });

        // 3. Insert the Aero Dining Table
        await prisma.product.create({
            data: {
                name: "Aero Dining Table",
                description: "A sleek minimalist curved dining table crafted from dark walnut wood.",
                status: "published",
                price: 129900,
                images: ["/variants/walnut_table_1.png", "/variants/walnut_table_2.png", "/variants/walnut_table_3.png"],
                stockQuantity: 20,
                style: "Minimalist",
                variants: {
                    create: [
                        { colorName: "Walnut", colorHex: "#43270F", images: ["/variants/walnut_table_1.png", "/variants/walnut_table_2.png", "/variants/walnut_table_3.png"] },
                        { colorName: "Whitewash", colorHex: "#EAE6DF", images: ["/variants/whitewash_table_1.png", "/variants/whitewash_table_2.png", "/variants/whitewash_table_3.png"] }
                    ]
                }
            }
        });

        // 4. Insert the Nimbus Lounge Sofa
        await prisma.product.create({
            data: {
                name: "Nimbus Lounge Sofa",
                description: "A modern curvy lounge sofa in boucle fabric.",
                status: "published",
                price: 159900,
                images: ["/variants/rust_sofa_1.png", "/variants/rust_sofa_2.png", "/variants/rust_sofa_2.png"],
                stockQuantity: 15,
                style: "Modern",
                variants: {
                    create: [
                        { colorName: "Rust", colorHex: "#8B4000", images: ["/variants/rust_sofa_1.png", "/variants/rust_sofa_2.png", "/variants/rust_sofa_2.png"] }
                    ]
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
