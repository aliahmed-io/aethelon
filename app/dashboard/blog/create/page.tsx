"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { createBlogPost } from "@/app/actions/blog";
import { ArrowLeft, Loader2, Save, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";

export default function CreateBlogPostPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        metaDescription: "",
        author: "Aethelon Team",
        published: false,
        category: "General",
        readTime: ""
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: prev.slug || generateSlug(title)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createBlogPost({
                ...formData,
                image: imageUrl
            });
            router.push("/dashboard/blog");
        } catch (error) {
            console.error("Failed to create post:", error);
            alert("Failed to create post. See console.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
            <div className="flex items-center gap-4 border-b border-border pb-4">
                <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Link href="/dashboard/blog">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-light tracking-tight uppercase">Write Article</h1>
                    <p className="text-sm text-muted-foreground">Draft a new entry for the Aethelon Journal.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Editor Core */}
                        <Card className="bg-muted/30 border-border backdrop-blur-sm rounded-sm">
                            <CardHeader>
                                <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Article Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-xs uppercase tracking-widest text-muted-foreground">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        required
                                        className="bg-background text-lg py-6 font-medium border-border"
                                        placeholder="The Future of Sustainable Design..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content" className="text-xs uppercase tracking-widest text-muted-foreground">Body Context (Markdown Supported)</Label>
                                    <Textarea
                                        id="content"
                                        value={formData.content}
                                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        required
                                        className="bg-background min-h-[400px] border-border resize-y font-mono text-sm leading-relaxed"
                                        placeholder="## Introduction&#10;&#10;Write your article here..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* SEO Options */}
                        <Card className="bg-muted/30 border-border backdrop-blur-sm rounded-sm">
                            <CardHeader>
                                <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Search & Meta Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-xs uppercase tracking-widest text-muted-foreground">URL Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        required
                                        className="bg-background border-border font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="excerpt" className="text-xs uppercase tracking-widest text-muted-foreground">Summary Excerpt</Label>
                                    <Textarea
                                        id="excerpt"
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                        className="bg-background h-24 border-border resize-none"
                                        placeholder="A brief summary for the blog card..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="metaDescription" className="text-xs uppercase tracking-widest text-muted-foreground">SEO Description</Label>
                                    <Input
                                        id="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                                        className="bg-background border-border"
                                        placeholder="Meta tag description for search engines..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="space-y-8">
                        <Card className="bg-muted/30 border-border backdrop-blur-sm rounded-sm sticky top-28">
                            <CardHeader>
                                <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Publishing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between border border-border p-4 rounded-sm bg-background">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold">Publish to Live</Label>
                                        <p className="text-xs text-muted-foreground">Make article public immediately.</p>
                                    </div>
                                    <Switch
                                        checked={formData.published}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Cover Image</Label>
                                    {imageUrl ? (
                                        <div className="relative border border-border rounded-sm overflow-hidden aspect-video">
                                            <Image src={imageUrl} alt="Cover" fill unoptimized className="object-cover" />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2 h-7 text-xs"
                                                onClick={() => setImageUrl("")}
                                                type="button"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="border border-dashed border-border p-4 rounded-sm bg-background">
                                            <UploadDropzone
                                                appearance={{ container: "border-0 p-0" }}
                                                endpoint="imageUploader"
                                                onClientUploadComplete={(res) => {
                                                    if (res?.[0]?.url) setImageUrl(res[0].url);
                                                }}
                                                onUploadError={(error: Error) => alert(`ERROR! ${error.message}`)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="author" className="text-xs uppercase tracking-widest text-muted-foreground">Author Name</Label>
                                    <Input
                                        id="author"
                                        value={formData.author}
                                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                                        className="bg-background border-border text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="bg-background border-border text-sm"
                                        placeholder="General"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="readTime" className="text-xs uppercase tracking-widest text-muted-foreground">Read Time</Label>
                                    <Input
                                        id="readTime"
                                        value={formData.readTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                                        className="bg-background border-border text-sm"
                                        placeholder="e.g. 3 min read"
                                    />
                                </div>

                                <div className="pt-4 border-t border-border/50 flex flex-col gap-3">
                                    <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (
                                            formData.published ? <><Send className="w-4 h-4 mr-2" /> Publish Now</> : <><Save className="w-4 h-4 mr-2" /> Save Draft</>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
