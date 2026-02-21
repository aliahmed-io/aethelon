"use client";

import { useState } from "react";
import { createCategory } from "@/app/store/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";

function SubmitBtn() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="bg-white text-black hover:bg-gray-200">
            {pending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Create Category
        </Button>
    );
}

export function CreateCategoryForm({ categories }: { categories: { id: string; name: string }[] }) {
    const [parentId, setParentId] = useState("");
    const [rankingMode, setRankingMode] = useState("DEFAULT");
    const [, action] = useActionState(createCategory, null);

    return (
        <form action={action}>
            <input type="hidden" name="parentId" value={parentId} />
            <input type="hidden" name="rankingMode" value={rankingMode} />
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/categories">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-light uppercase tracking-widest">New Category</h1>
            </div>

            <Card className="mt-5 bg-white/5 border-white/10 backdrop-blur-sm text-white">
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                    <CardDescription className="text-white/50">
                        Create a new category for your products
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Name</Label>
                            <Input name="name" required placeholder="Category Name" className="bg-black/20 border-white/10 text-white" />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Slug (optional)</Label>
                            <Input name="slug" placeholder="Auto-generated from name" className="bg-black/20 border-white/10 text-white" />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Description</Label>
                            <Input name="description" required placeholder="Category Description" className="bg-black/20 border-white/10 text-white" />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Image URL (optional)</Label>
                            <Input name="image" type="url" placeholder="https://..." className="bg-black/20 border-white/10 text-white" />
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Parent Category</Label>
                            <Select value={parentId} onValueChange={setParentId}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                    <SelectValue placeholder="None (top-level)" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/10">
                                    <SelectItem value="">None</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Ranking Mode</Label>
                            <Select value={rankingMode} onValueChange={setRankingMode}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/10">
                                    <SelectItem value="DEFAULT">Default</SelectItem>
                                    <SelectItem value="SEMANTIC">Semantic</SelectItem>
                                    <SelectItem value="TRENDING">Trending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitBtn />
                </CardFooter>
            </Card>
        </form>
    );
}
