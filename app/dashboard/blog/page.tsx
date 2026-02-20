import { getBlogPosts, deleteBlogPost } from "@/app/actions/blog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AdminBlogPage() {
    const posts = await getBlogPosts(true);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h1 className="text-3xl font-light tracking-tight uppercase">Journal CMS</h1>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 gap-2">
                    <Link href="/dashboard/blog/create">
                        <PlusCircle className="w-4 h-4" />
                        New Article
                    </Link>
                </Button>
            </div>

            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-sm bg-muted/20">
                    <p className="text-muted-foreground uppercase tracking-widest text-xs">No articles published yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <div key={post.id} className="group relative bg-muted/30 border border-border backdrop-blur-sm rounded-sm overflow-hidden flex flex-col">
                            {post.image && (
                                <div className="h-40 relative">
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className={`${post.published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold uppercase tracking-tight mb-2 line-clamp-2">{post.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">{post.excerpt}</p>

                                <div className="flex items-center gap-2 mt-auto border-t border-border/50 pt-4">
                                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent border-border text-xs">
                                        <Link href={`/dashboard/blog/${post.id}`}>
                                            <Edit className="w-3 h-3 mr-2" /> Edit
                                        </Link>
                                    </Button>
                                    <form action={async () => {
                                        "use server";
                                        await deleteBlogPost(post.id);
                                    }}>
                                        <Button variant="outline" size="sm" type="submit" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-border px-3">
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
