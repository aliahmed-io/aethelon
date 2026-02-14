"use server";

import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function importProducts(formData: FormData) {
    await requireAdmin();
    const csvData = formData.get("csvData") as string;
    const isDryRun = formData.get("dryRun") === "on";

    if (!csvData) return { message: "No CSV data provided" };

    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());

    // Basic Validation
    const required = ["name", "price", "description", "categoryId"];
    const missing = required.filter(h => !headers.includes(h));

    if (missing.length > 0) {
        return { message: `Missing required headers: ${missing.join(", ")}` };
    }

    const productsToCreate = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Robust CSV split handling quoted commas
        // Matches: quoted fields OR non-comma fields
        // Implementation moved to parseCSVLine function below.

        // The regex above is tricky. Let's use a simpler standard one or a proven snippet.
        // Standard snippet: 
        // line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) - fails on empty fields

        // Let's stick to the Plan's regex: /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g
        // But implementing via `split` is hard.
        // Let's use a proven implementation for single line parsing.

        const parseCSVLine = (text: string) => {
            const result = [];
            let start = 0;
            let inQuotes = false;
            for (let j = 0; j < text.length; j++) {
                if (text[j] === '"') {
                    inQuotes = !inQuotes;
                } else if (text[j] === ',' && !inQuotes) {
                    let field = text.substring(start, j).trim();
                    if (field.startsWith('"') && field.endsWith('"')) {
                        field = field.slice(1, -1).replace(/""/g, '"');
                    }
                    result.push(field);
                    start = j + 1;
                }
            }
            // Last field
            let field = text.substring(start).trim();
            if (field.startsWith('"') && field.endsWith('"')) {
                field = field.slice(1, -1).replace(/""/g, '"');
            }
            result.push(field);
            return result;
        };

        const values = parseCSVLine(line);

        const row: Record<string, any> = {};
        headers.forEach((h, index) => {
            row[h] = values[index];
        });

        // Type Casting & Validation
        try {
            const price = parseInt(row.price);
            if (isNaN(price)) throw new Error("Invalid Price");

            productsToCreate.push({
                name: row.name,
                description: row.description,
                price: price,
                categoryId: row.categoryId,
                status: (row.status === "published" || row.status === "draft") ? row.status : "draft",
                stockQuantity: row.stockQuantity ? parseInt(row.stockQuantity) : 0,
                // Defaults
                images: [],
                tags: []
            });
        } catch (e) {
            errors.push(`Line ${i + 1}: ${(e as Error).message}`);
        }
    }

    if (errors.length > 0 && isDryRun) {
        return { message: `Dry Run Failed with ${errors.length} errors`, errors };
    }

    if (isDryRun) {
        return { message: `Dry Run Success. Ready to import ${productsToCreate.length} products.` };
    }

    try {
        await prisma.$transaction(
            productsToCreate.map(p => prisma.product.create({ data: p }))
        );
        revalidatePath("/dashboard/products");
        return { message: `Imported ${productsToCreate.length} products successfully.` };
    } catch (e) {
        console.error(e);
        return { message: "Database Error during import" };
    }
}
