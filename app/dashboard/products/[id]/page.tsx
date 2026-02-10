import Prisma from "@/lib/db";
import { ProductForm } from "@/components/dashboard/ProductForm";
import { notFound } from "next/navigation";

// Correct syntax for params in Next.js 15+ (server components)
// But to be safe with all versions, we assume basic props or use 'await params' if strictly 15.
// For now, using standard props interface.
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch product and categories in parallel
    const [product, categories] = await Promise.all([
        Prisma.product.findUnique({ where: { id } }),
        Prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);

    if (!product) {
        return notFound();
    }

    return <ProductForm categories={categories} initialData={product} />;
}
