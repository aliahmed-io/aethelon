import Prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { EditBlogPostForm } from "./EditBlogPostForm";

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
    const post = await Prisma.blogPost.findUnique({
        where: { id: params.id },
    });

    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
            <div className="flex items-center gap-4 border-b border-border pb-4">
                <div>
                    <h1 className="text-2xl font-light tracking-tight uppercase">Edit Article</h1>
                    <p className="text-sm text-muted-foreground">Modify an existing entry in the Aethelon Journal.</p>
                </div>
            </div>

            <EditBlogPostForm initialData={post} />
        </div>
    );
}
