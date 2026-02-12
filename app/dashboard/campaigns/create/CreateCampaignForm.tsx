"use client";

import { createCampaign } from "@/app/store/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignGenerator } from "@/components/dashboard/CampaignGenerator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { UploadDropzone } from "@/lib/uploadthing";
import { useActionState, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
}

function SubmitBtn() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="bg-white text-black hover:bg-gray-200 uppercase tracking-widest">
            {pending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Create Campaign
        </Button>
    )
}

export function CreateCampaignForm({ products }: { products: Product[] }) {
    const [image, setImage] = useState<string | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [, action] = useActionState(createCampaign, undefined);

    const toggleProduct = (id: string) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter(p => p !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };



    return (
        <form action={action}>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/campaigns">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-light uppercase tracking-widest">New Campaign</h1>
            </div>

            <Card className="mt-5 bg-white/5 border-white/10 backdrop-blur-sm text-white">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        Campaign Details
                        <div className="flex gap-2">
                        </div>
                    </CardTitle>
                    <CardDescription className="text-white/50">Create a new marketing campaign collection</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* AI Generator */}
                    <CampaignGenerator
                        selectedProductNames={products.filter(p => selectedProducts.includes(p.id)).map(p => p.name)}
                        onGenerate={(data) => {
                            // Populate form fields
                            const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
                            const descInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;

                            if (titleInput) titleInput.value = data.subject; // Map subject to title/subject line
                            if (descInput) descInput.value = data.body; // Map body to description (HTML)
                        }}
                    />

                    <div className="flex flex-col gap-6">
                        {/* Basic Info */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Title</Label>
                                <Input name="title" required placeholder="Summer Collection 2026" className="bg-black/20 border-white/10 text-white" />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Details</Label>
                                <Input disabled placeholder="Slug auto-generated" className="bg-white/5 border-white/10 text-white/30" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Description</Label>
                            <Textarea name="description" placeholder="Describe the campaign..." className="bg-black/20 border-white/10 text-white min-h-[100px]" />
                        </div>

                        {/* Image Upload */}
                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Hero Image</Label>
                            <input type="hidden" name="imageString" value={image || ""} />
                            {image ? (
                                <div className="relative w-full h-[300px] rounded-lg border border-white/10 overflow-hidden group">
                                    <Image src={image} alt="Campaign Hero" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => setImage(null)} className="bg-red-500 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-red-600">Remove Image</button>
                                    </div>
                                </div>
                            ) : (
                                <UploadDropzone
                                    className="ut-label:text-white/70 ut-button:bg-white/10 ut-button:text-white ut-button:hover:bg-white/20 border-white/10 bg-black/20"
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res: { url: string }[]) => {
                                        setImage(res[0].url);
                                    }}
                                    onUploadError={() => {
                                        alert("Error uploading image");
                                    }}
                                />
                            )}
                        </div>

                        {/* Product Selection */}
                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Select Products ({selectedProducts.length})</Label>
                            <input type="hidden" name="selectedProducts" value={JSON.stringify(selectedProducts)} />

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-4 bg-black/20 rounded-md border border-white/10">
                                {products.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => toggleProduct(product.id)}
                                        className={cn(
                                            "relative aspect-[3/4] rounded-sm overflow-hidden border cursor-pointer group transition-all",
                                            selectedProducts.includes(product.id)
                                                ? "border-amber-400 ring-1 ring-amber-400 opacity-100"
                                                : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                                        )}
                                    >
                                        <Image src={product.images[0] || ""} alt={product.name} fill className="object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2">
                                            <p className="text-[10px] text-white font-medium truncate">{product.name}</p>
                                            <p className="text-[10px] text-white/50">${product.price}</p>
                                        </div>
                                        {selectedProducts.includes(product.id) && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-black" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitBtn />
                </CardFooter>
            </Card>
        </form >
    );
}
