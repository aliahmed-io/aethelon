"use client";

import { createCategory } from "@/app/store/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
// I will create a unified SubmitButton component in components/dashboard/SubmitButtons.tsx for reusability
// For now, I'll inline the simple submit button logic here or duplicate the one from ProductForm.
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

function SubmitBtn() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="bg-white text-black hover:bg-gray-200">
            {pending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Create Category
        </Button>
    );
}

import { useActionState } from "react";

export default function CreateCategoryRoute() {
    const [, action] = useActionState(createCategory, null);

    return (
        <form action={action}>
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
                            <Label className="uppercase text-xs tracking-widest text-white/50">Description</Label>
                            <Input name="description" required placeholder="Category Description" className="bg-black/20 border-white/10 text-white" />
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
