import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogPosts } from '@/app/actions/blog';
import ReactMarkdown from 'react-markdown';



export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
        return {
            title: 'Post Not Found | Aethelon Journal',
        };
    }

    return {
        title: `${post.title} | Aethelon Journal`,
        description: post.metaDescription || post.excerpt || `Read more about ${post.title} on Aethelon Journal.`,
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post || !post.published) {
        notFound();
    }

    // Default image if none provided
    const headerImage = post.image || "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=2000";

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <article className="container mx-auto px-6 max-w-4xl">
                {/* Back Link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-12"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Journal
                </Link>

                {/* Header */}
                <header className="mb-12 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-accent">{post.category || "Journal"}</span>
                        <span className="hidden md:inline text-muted-foreground/30">•</span>
                        <time dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString()} className="text-sm font-mono text-muted-foreground">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently"}
                        </time>
                        {post.readTime && (
                            <>
                                <span className="hidden md:inline text-muted-foreground/30">•</span>
                                <span className="text-sm font-mono text-muted-foreground">{post.readTime} read</span>
                            </>
                        )}
                        <span className="hidden md:inline text-muted-foreground/30">•</span>
                        <span className="text-sm font-mono text-muted-foreground">By {post.author}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display tracking-tight leading-[1.1] mb-6">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                            {post.excerpt}
                        </p>
                    )}
                </header>

                {/* Hero Image */}
                <div className="aspect-[21/9] relative overflow-hidden rounded-sm bg-muted mb-16">
                    <Image
                        src={headerImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1200px) 100vw, 1200px"
                        priority
                    />
                </div>

                {/* Content */}
                <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert prose-lg 
                    prose-headings:font-display prose-headings:font-light prose-headings:tracking-tight
                    prose-p:leading-relaxed prose-p:text-muted-foreground
                    prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-sm prose-img:w-full
                    prose-blockquote:border-l-accent prose-blockquote:font-display prose-blockquote:text-xl prose-blockquote:font-light prose-blockquote:not-italic
                    pb-12 border-b border-border">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
            </article>
        </main>
    );
}
