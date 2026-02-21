import prisma from "@/lib/db";
import { CreateCategoryForm } from "./CreateCategoryForm";

export default async function NewCategoryPage() {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });

    return <CreateCategoryForm categories={categories} />;
}
