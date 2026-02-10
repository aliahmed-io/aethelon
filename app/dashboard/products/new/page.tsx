import Prisma from "@/lib/db";
export const dynamic = "force-dynamic";
import { ProductForm } from "@/components/dashboard/ProductForm";

async function getCategories() {
    return await Prisma.category.findMany({
        orderBy: { name: "asc" },
    });
}

export default async function NewProductPage() {
    const categories = await getCategories();
    return <ProductForm categories={categories} />;
}
