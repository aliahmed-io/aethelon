import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/app/actions/blog";
import { BlogPost } from "@prisma/client";

export const metadata: Metadata = {
    title: "Journal — Aethelon",
    description: "Design stories, craft process journals, and living inspiration from the Aethelon editorial team.",
};

export const revalidate = 3600;

export default async function BlogPage() {
    // Fetch dynamic, published posts from database
    const blogPosts = await getBlogPosts(false);

    // Extract categories from blogPosts
    const dynamicCategories = Array.from(new Set(blogPosts.map(post => post.category)));
    const CATEGORIES = ["All", ...dynamicCategories];

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto max-w-6xl px-6 lg:px-12">
                <header className="mb-16">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-4">
                        Journal
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-md">
                        Design stories, craft process journals, and inspiration for living beautifully.
                    </p>
                </header>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2 mb-12">
                    {CATEGORIES.map((cat) => (
                        <span
                            key={cat}
                            className={`px-4 py-2 text-xs uppercase tracking-widest rounded-sm border transition-colors cursor-default ${cat === "All"
                                ? "bg-accent text-accent-foreground border-accent"
                                : "bg-transparent text-muted-foreground border-border hover:border-foreground"
                                }`}
                        >
                            {cat}
                        </span>
                    ))}
                </div>

                {blogPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 border border-dashed border-border rounded-sm">
                        <p className="text-muted-foreground uppercase tracking-widest text-sm">No articles published yet. Check back soon.</p>
                    </div>
                ) : (
                    <div>
                        {/* Featured post (First array item) */}
                        <Link href={`/blog/${blogPosts[0].slug}`} className="group block mb-16">
                            <article className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="aspect-[4/3] relative overflow-hidden rounded-sm bg-muted">
                                    <Image
                                        src={blogPosts[0].image || "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1200"}
                                        alt={blogPosts[0].title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority
                                    />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xs uppercase tracking-widest text-accent">{blogPosts[0].category || "Featured Article"}</span>
                                        {blogPosts[0].readTime && (
                                            <>
                                                <span className="text-muted-foreground/30">•</span>
                                                <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-mono">{blogPosts[0].readTime}</span>
                                            </>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight mb-4 group-hover:text-accent transition-colors">
                                        {blogPosts[0].title}
                                    </h2>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                        {blogPosts[0].excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                                        <time dateTime={blogPosts[0].publishedAt ? new Date(blogPosts[0].publishedAt).toISOString() : new Date().toISOString()}>
                                            {blogPosts[0].publishedAt ? new Date(blogPosts[0].publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently"}
                                        </time>
                                    </div>
                                </div>
                            </article>
                        </Link>

                        {blogPosts.length > 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {blogPosts.slice(1).map((post: BlogPost) => (
                                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group relative bg-muted/30 border border-border backdrop-blur-sm rounded-sm overflow-hidden flex flex-col hover:border-accent transition-colors">
                                        <article className="flex-1 flex flex-col">
                                            <div className="aspect-[4/3] relative overflow-hidden bg-muted mb-4">
                                                <Image
                                                    src={post.image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200"}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                            </div>
                                            <div className="flex flex-col flex-1 p-4 pt-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs uppercase tracking-widest text-accent block line-clamp-1">{post.category}</span>
                                                    {post.readTime && <span className="text-[10px] font-mono text-muted-foreground">{post.readTime}</span>}
                                                </div>
                                                <h3 className="text-lg font-bold tracking-tight mb-2 group-hover:text-accent transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{post.excerpt}</p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mt-auto">
                                                    <time dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString()}>
                                                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Recently"}
                                                    </time>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
