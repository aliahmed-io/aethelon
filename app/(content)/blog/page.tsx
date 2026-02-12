import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Journal — Aethelon",
    description: "Design stories, craft process journals, and living inspiration from the Aethelon editorial team.",
};

/** Static blog data — replace with CMS integration when ready */
const BLOG_POSTS = [
    {
        slug: "art-of-solid-oak",
        title: "The Art of Solid Oak",
        excerpt: "How we source, season, and shape FSC-certified American white oak into heirloom furniture that lasts generations.",
        category: "Craft",
        date: "2026-01-15",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=1200&auto=format&fit=crop",
        readTime: "6 min",
    },
    {
        slug: "designing-with-light",
        title: "Designing with Light",
        excerpt: "Our design team shares how natural light influences every silhouette, finish, and placement we recommend.",
        category: "Design",
        date: "2026-01-28",
        image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop",
        readTime: "4 min",
    },
    {
        slug: "minimalism-meets-comfort",
        title: "When Minimalism Meets Comfort",
        excerpt: "Why the most restrained designs often deliver the deepest comfort — and how we achieve both.",
        category: "Philosophy",
        date: "2026-02-05",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop",
        readTime: "5 min",
    },
    {
        slug: "sustainable-supply-chain",
        title: "Our Sustainable Supply Chain",
        excerpt: "From forest to showroom, a transparent look at every step in our FSC-certified sourcing process.",
        category: "Sustainability",
        date: "2026-02-10",
        image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop",
        readTime: "7 min",
    },
] as const;

const CATEGORIES = ["All", ...new Set(BLOG_POSTS.map((p) => p.category))] as const;

export function generateStaticParams() {
    return [];
}

export default function BlogPage() {
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

                {/* Featured post */}
                <Link href={`/blog/${BLOG_POSTS[0].slug}`} className="group block mb-16">
                    <article className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="aspect-[4/3] relative overflow-hidden rounded-sm bg-muted">
                            <Image
                                src={BLOG_POSTS[0].image}
                                alt={BLOG_POSTS[0].title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-xs uppercase tracking-widest text-accent mb-3">{BLOG_POSTS[0].category}</span>
                            <h2 className="text-3xl font-bold tracking-tight mb-4 group-hover:text-accent transition-colors">
                                {BLOG_POSTS[0].title}
                            </h2>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                {BLOG_POSTS[0].excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                                <time dateTime={BLOG_POSTS[0].date}>
                                    {new Date(BLOG_POSTS[0].date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                </time>
                                <span>·</span>
                                <span>{BLOG_POSTS[0].readTime} read</span>
                            </div>
                        </div>
                    </article>
                </Link>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.slice(1).map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                            <article>
                                <div className="aspect-[4/3] relative overflow-hidden rounded-sm bg-muted mb-4">
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                                <span className="text-xs uppercase tracking-widest text-accent mb-2 block">{post.category}</span>
                                <h3 className="text-lg font-bold tracking-tight mb-2 group-hover:text-accent transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                                    <time dateTime={post.date}>
                                        {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </time>
                                    <span>·</span>
                                    <span>{post.readTime}</span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
