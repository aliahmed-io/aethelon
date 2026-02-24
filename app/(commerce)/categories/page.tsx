import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "All Categories — Aethelon",
    description: "Explore our comprehensive collection of premium furniture categories.",
};

export const dynamic = "force-dynamic";
export default async function CategoriesIndexPage() {
    // Fetch top-level categories
    const categories = await prisma.category.findMany({
        where: { parentId: null },
        include: {
            _count: {
                select: { products: true } // Direct products
            }
        },
        orderBy: { name: 'asc' }
    });

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto px-6 lg:px-12">
                <header className="mb-16 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
                        Our Categories
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Curated categories for every space in your home.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            className="group relative overflow-hidden rounded-md bg-muted block h-full isolate"
                        >
                            <Image
                                src={category.image || "/assets/placeholder.svg"}
                                alt={category.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                quality={60}
                            />

                            {/* Overlay / Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />

                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                                        {category.name}
                                    </h2>
                                    <p className="text-white/70 text-sm line-clamp-2 max-w-[90%] mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        {category.description || `Explore our exclusive ${category.name} category.`}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-white/90">
                                        <span>Shop Now</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
