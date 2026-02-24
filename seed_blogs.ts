import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";



const BLOG_POSTS = [
    {
        slug: "art-of-solid-oak",
        title: "The Art of Solid Oak",
        excerpt: "How we source, season, and shape FSC-certified American white oak into heirloom furniture that lasts generations.",
        category: "Craft",
        publishedAt: new Date("2026-01-15"),
        image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1200",
        readTime: "6 min",
        content: `Solid oak is the cornerstone of Aethelon's heirloom collection. We don't just pick any wood; we source FSC-certified American white oak, seasoned carefully to withstand the test of time. 

The process begins with selection—identifying timber with the perfect grain pattern and structural integrity. From there, it undergoes a meticulous seasoning process, ensuring it's shaped into furniture that won't warp or degrade, but rather, develop a rich patina over generations.

Our master craftsmen then use traditional joinery techniques, blending ancient wisdom with modern precision. The result is furniture that is not just a utility, but a work of art.`,
    },
    {
        slug: "designing-with-light",
        title: "Designing with Light",
        excerpt: "Our design team shares how natural light influences every silhouette, finish, and placement we recommend.",
        category: "Design",
        publishedAt: new Date("2026-01-28"),
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
        readTime: "4 min",
        content: `Light is the most important invisible material we use. At Aethelon, we design silhouettes that don't just occupy space, but dance with the photons that pass through it.

In this article, our design team reveals how we consider the angle of the sun, the warmth of artificial lighting, and the reflective properties of our finishes. We believe that a piece of furniture should look as stunning in the golden hour as it does in the cool glow of a rainy afternoon.

Discover how to place your Aethelon pieces to maximize the natural light in your home, creating an atmosphere of ethereal beauty.`,
    },
    {
        slug: "minimalism-meets-comfort",
        title: "When Minimalism Meets Comfort",
        excerpt: "Why the most restrained designs often deliver the deepest comfort — and how we achieve both.",
        category: "Philosophy",
        publishedAt: new Date("2026-02-05"),
        image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1200",
        readTime: "5 min",
        content: `Minimalism is often associated with coldness or austerity. At Aethelon, we challenge that notion. We believe that the most restrained designs can—and should—deliver the deepest comfort.

Our philosophy is built on the idea that every curve, every texture, and every Proportion is intentional. By removing the unnecessary, we highlight the essential: the softness of the fabric, the warmth of the wood, and the support of the structure.

This isn't just about aesthetics; it's about creating a space where the mind can rest as comfortably as the body.`,
    },
    {
        slug: "sustainable-supply-chain",
        title: "Our Sustainable Supply Chain",
        excerpt: "From forest to showroom, a transparent look at every step in our FSC-certified sourcing process.",
        category: "Sustainability",
        publishedAt: new Date("2026-02-10"),
        image: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=1200",
        readTime: "7 min",
        content: `Transparency is a core value at Aethelon. We want you to know exactly where your furniture comes from and the impact its journey has on the planet.

Our supply chain is 100% FSC-certified, ensuring that for every tree harvested, more are planted, and the local ecosystem is protected. But our commitment goes beyond just sourcing. From ethical labor practices in our workshops to carbon-neutral shipping methods, we audit every step.

Join us on a journey from the sustainable forests of North America to the Aethelon showroom, and see how we're building a future that lasts.`,
    },
];

async function main() {
    console.log("Starting Blog Seeding...");

    const prisma = new PrismaClient({
        accelerateUrl: process.env.DATABASE_URL!,
    }).$extends(withAccelerate());

    try {
        for (const post of BLOG_POSTS) {
            await prisma.blogPost.upsert({
                where: { slug: post.slug },
                update: {
                    title: post.title,
                    excerpt: post.excerpt,
                    category: post.category,
                    image: post.image,
                    readTime: post.readTime,
                    content: post.content,
                    published: true,
                    publishedAt: post.publishedAt,
                },
                create: {
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt,
                    category: post.category,
                    image: post.image,
                    readTime: post.readTime,
                    content: post.content,
                    published: true,
                    publishedAt: post.publishedAt,
                    author: "Aethelon Team",
                }
            });
        }
        console.log(`Upserted ${BLOG_POSTS.length} blog posts.`);
        console.log("Blog Seeding Complete.");
    } catch (e) {
        console.error("Blog Seeding Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
