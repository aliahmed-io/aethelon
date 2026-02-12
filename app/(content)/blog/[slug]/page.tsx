import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Share2 } from "lucide-react";

/** Static blog data — replace with CMS integration when ready */
const BLOG_POSTS: Record<string, {
    title: string;
    excerpt: string;
    category: string;
    date: string;
    image: string;
    readTime: string;
    content: string[];
}> = {
    "art-of-solid-oak": {
        title: "The Art of Solid Oak",
        excerpt: "How we source, season, and shape FSC-certified American white oak into heirloom furniture that lasts generations.",
        category: "Craft",
        date: "2026-01-15",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=1200&auto=format&fit=crop",
        readTime: "6 min",
        content: [
            "Every Aethelon piece begins its journey in the forests of Appalachia, where our FSC-certified partners practice selective harvesting that ensures the health of old-growth ecosystems.",
            "Once selected, planks are air-dried for a minimum of 18 months before entering our kiln program. This patience is non-negotiable — rushed drying causes internal stress that manifests years later as warping or cracking.",
            "Our artisans work each piece using a combination of traditional hand tools and precision CNC routing. The CNC handles repeatable geometry — mortise and tenon joints cut to 0.1mm tolerances — while hand tools bring the surface to life with subtle undulations that catch light differently depending on angle.",
            "The final finish is a water-based hardwax oil that penetrates the grain without forming a plastic film on the surface. You feel the wood, not a coating. It ages gracefully, developing a patina that tells the story of how the piece has been lived with.",
            "Each piece ships with a provenance certificate documenting the specific forest, the harvest date, and the name of the lead artisan who brought it to completion.",
        ],
    },
    "designing-with-light": {
        title: "Designing with Light",
        excerpt: "Our design team shares how natural light influences every silhouette, finish, and placement we recommend.",
        category: "Design",
        date: "2026-01-28",
        image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop",
        readTime: "4 min",
        content: [
            "Light is the invisible material in every room. A piece of furniture that looks stunning in a north-facing studio may feel entirely different in a sun-drenched conservatory. Our design process accounts for this from the earliest sketch.",
            "We test every finish under five standardized lighting conditions: direct sunlight, overcast daylight, warm tungsten, cool LED, and candlelight. The goal is dimensional consistency — the piece should feel equally considered in any setting.",
            "Our AI Vision tool lets customers upload a photo of their actual room. The system analyzes dominant light temperature and suggests finishes that harmonize rather than fight the existing palette.",
        ],
    },
    "minimalism-meets-comfort": {
        title: "When Minimalism Meets Comfort",
        excerpt: "Why the most restrained designs often deliver the deepest comfort — and how we achieve both.",
        category: "Philosophy",
        date: "2026-02-05",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop",
        readTime: "5 min",
        content: [
            "There is a persistent myth that minimalist furniture sacrifices comfort for aesthetics. Our philosophy is the opposite: by removing the unnecessary, we create more space for the essential — which is, almost always, how the piece feels against your body.",
            "Our Lounge Chair, for example, has just four visible components: two side panels, a seat shell, and a cushion. But hidden inside that simplicity are 14 engineering decisions — from the flex angle of the laminated plywood to the density gradient of the foam — all calibrated for the way a human body settles over the course of an evening.",
            "True comfort is invisible. When a chair is doing its job, you forget it exists.",
        ],
    },
    "sustainable-supply-chain": {
        title: "Our Sustainable Supply Chain",
        excerpt: "From forest to showroom, a transparent look at every step in our FSC-certified sourcing process.",
        category: "Sustainability",
        date: "2026-02-10",
        image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop",
        readTime: "7 min",
        content: [
            "Sustainability at Aethelon is not a marketing program — it is an engineering constraint that shapes every decision from material selection to logistics routing.",
            "All primary woods carry FSC Chain of Custody certification. Our leather comes from LWG Gold-rated tanneries in Italy. Upholstery fabrics are OEKO-TEX Standard 100 certified, and our foam supplier has eliminated HCFCs from their entire production line.",
            "We publish a full environmental impact report annually. Our 2025 report documented a 23% reduction in per-unit carbon footprint compared to 2023, achieved primarily through optimized freight consolidation and local finishing partnerships in North America and Europe.",
            "Every Aethelon product page includes a Materials & Provenance section. We believe customers deserve the same transparency about their furniture that they expect from their food.",
        ],
    },
};

const SLUGS = Object.keys(BLOG_POSTS);

export function generateStaticParams() {
    return SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    return params.then(({ slug }) => {
        const post = BLOG_POSTS[slug];
        if (!post) return { title: "Post Not Found — Aethelon" };
        return {
            title: `${post.title} — Aethelon Journal`,
            description: post.excerpt,
        };
    });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = BLOG_POSTS[slug];
    if (!post) return notFound();

    const relatedSlugs = SLUGS.filter((s) => s !== slug).slice(0, 2);

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <div className="container mx-auto max-w-3xl px-6 lg:px-12">
                {/* Back link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-12"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Journal
                </Link>

                <article>
                    <header className="mb-10">
                        <span className="text-xs uppercase tracking-widest text-accent mb-3 block">{post.category}</span>
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6">{post.title}</h1>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono mb-8">
                            <time dateTime={post.date}>
                                {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </time>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime} read</span>
                        </div>
                    </header>

                    {/* Hero image */}
                    <div className="aspect-[16/9] relative overflow-hidden rounded-sm bg-muted mb-12">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 768px"
                        />
                    </div>

                    {/* Body */}
                    <div className="prose prose-sm max-w-none">
                        {post.content.map((paragraph, i) => (
                            <p key={i} className="text-muted-foreground leading-relaxed text-sm mb-6">
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    {/* Share */}
                    <div className="flex items-center gap-4 mt-12 pt-8 border-t border-border">
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-widest text-muted-foreground">Share this article</span>
                    </div>
                </article>

                {/* Related posts */}
                {relatedSlugs.length > 0 && (
                    <section className="mt-20 border-t border-border pt-12">
                        <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-8">Continue Reading</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {relatedSlugs.map((s) => {
                                const related = BLOG_POSTS[s];
                                if (!related) return null;
                                return (
                                    <Link key={s} href={`/blog/${s}`} className="group">
                                        <div className="aspect-[4/3] relative overflow-hidden rounded-sm bg-muted mb-4">
                                            <Image
                                                src={related.image}
                                                alt={related.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        </div>
                                        <span className="text-xs uppercase tracking-widest text-accent mb-2 block">{related.category}</span>
                                        <h3 className="text-lg font-bold tracking-tight group-hover:text-accent transition-colors">{related.title}</h3>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
