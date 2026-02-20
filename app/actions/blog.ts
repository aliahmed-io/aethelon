"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBlogPost(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    metaDescription?: string;
    image?: string;
    published?: boolean;
    author?: string;
    category?: string;
    readTime?: string;
}) {
    const post = await prisma.blogPost.create({
        data: {
            ...data,
            publishedAt: data.published ? new Date() : null,
        },
    });

    revalidatePath("/dashboard/blog");
    if (data.published) {
        revalidatePath("/blog");
    }

    return post;
}

export async function updateBlogPost(id: string, data: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    metaDescription?: string;
    image?: string;
    published?: boolean;
    author?: string;
    category?: string;
    readTime?: string;
}) {
    // Check if transitioning to published
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    let publishedAt = existing?.publishedAt;

    if (data.published && !existing?.published) {
        publishedAt = new Date();
    } else if (data.published === false) {
        publishedAt = null;
    }

    const post = await prisma.blogPost.update({
        where: { id },
        data: {
            ...data,
            publishedAt,
        },
    });

    revalidatePath("/dashboard/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);

    return post;
}

export async function deleteBlogPost(id: string) {
    const post = await prisma.blogPost.delete({
        where: { id },
    });

    revalidatePath("/dashboard/blog");
    revalidatePath("/blog");

    return post;
}

export async function getBlogPosts(adminView = false) {
    return prisma.blogPost.findMany({
        where: adminView ? undefined : { published: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function getBlogPostBySlug(slug: string) {
    return prisma.blogPost.findUnique({
        where: { slug },
    });
}
