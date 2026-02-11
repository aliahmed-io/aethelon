"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createProduct, editProduct } from "@/app/store/actions";
import { generateProductDescription, generate3DModel } from "@/app/store/ai-actions";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import Image from "next/image";
import { X, Loader2, ChevronLeft, Sparkles, Box, Upload } from "lucide-react";
import Link from "next/link";

interface ProductFormProps {
    categories: { id: string; name: string }[];
    initialData?: {
        id?: string;
        name?: string;
        description?: string;
        price?: number;
        images?: string[];
        categoryId?: string;
        status?: string;
        isFeatured?: boolean;
        stockQuantity?: number;
        weight?: number;
    } | null;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="h-12 px-8 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-foreground/90"
        >
            {pending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            {isEdit ? "Update Product" : "Create Product"}
        </Button>
    );
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);

    // Use useActionState to handle the server action response and signature
    const [, dispatch] = useActionState(initialData ? editProduct : createProduct, null);

    // AI Generation States
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [isGenerating3D, setIsGenerating3D] = useState(false);
    const [generatedDescription, setGeneratedDescription] = useState(initialData?.description || "");
    const [prodName, setProdName] = useState(initialData?.name || "");
    const [prodCategory, setProdCategory] = useState(initialData?.categoryId || "");

    const handleImageDelete = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleGenerateDesc = async () => {
        if (!prodName) {
            toast.error("Please enter a product name first.");
            return;
        }
        setIsGeneratingDesc(true);
        const catName = categories.find(c => c.id === prodCategory)?.name || "Luxury Furniture";

        try {
            const result = await generateProductDescription(prodName, catName);
            if (result.success && result.text) {
                setGeneratedDescription(result.text);
                toast.success("Description generated.");
            } else {
                toast.error("Failed to generate description.");
            }
        } catch (_e) {
            toast.error("Error generating description.");
        } finally {
            setIsGeneratingDesc(false);
        }
    };

    const handleGenerate3D = async () => {
        if (images.length === 0) {
            toast.error("Please upload images first.");
            return;
        }
        setIsGenerating3D(true);
        try {
            if (!initialData?.id) {
                toast.error("Save product first before generating 3D model.");
                return;
            }
            const result = await generate3DModel(initialData.id, images);
            if (result.success) {
                toast.success(`3D Generation started! Task ID: ${result.taskId}`);
            } else {
                toast.error(result.error);
            }
        } catch (_e) {
            toast.error("Error starting 3D generation.");
        } finally {
            setIsGenerating3D(false);
        }
    };

    return (
        <form action={dispatch} className="relative z-0">
            <input type="hidden" name="productId" value={initialData?.id} />

            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/products" className="p-2 border border-border rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-light tracking-tight uppercase text-foreground">
                    {initialData ? "Edit Product" : "New Product"}
                </h1>
                <div className="ml-auto">
                    <SubmitButton isEdit={!!initialData} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card border border-border p-8 rounded-sm space-y-8 relative overflow-hidden shadow-sm">
                        {/* Gradient Glow */}
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70 mb-4 border-b border-border pb-4">Product Info</h3>

                            <div className="space-y-3">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">Name</Label>
                                <Input
                                    name="name"
                                    required
                                    defaultValue={initialData?.name}
                                    value={prodName}
                                    onChange={(e) => setProdName(e.target.value)}
                                    className="h-12 border-border focus:border-accent/50 transition-colors"
                                    placeholder="e.g. Lounge Chair"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="uppercase text-xs tracking-widest text-muted-foreground">Description</Label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateDesc}
                                        disabled={isGeneratingDesc}
                                        className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                    >
                                        {isGeneratingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        Auto-Generate
                                    </button>
                                </div>
                                <div className="relative">
                                    <Textarea
                                        name="description"
                                        required
                                        value={generatedDescription}
                                        onChange={(e) => setGeneratedDescription(e.target.value)}
                                        className="min-h-[180px] border-border focus:border-accent/50 transition-colors resize-none leading-relaxed p-4"
                                        placeholder="Product description... (Tip: Mention materials like Oak, Walnut, Leather)"
                                    />
                                    {isGeneratingDesc && (
                                        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center border border-border rounded-md">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                                                <span className="text-xs uppercase tracking-widest text-foreground/70">Crafting Narrative...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border p-8 rounded-sm space-y-8 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Media Asset</h3>
                            <button
                                type="button"
                                onClick={handleGenerate3D}
                                disabled={isGenerating3D || images.length === 0}
                                className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                                {isGenerating3D ? <Loader2 className="w-3 h-3 animate-spin" /> : <Box className="w-3 h-3" />}
                                Generate 3D Model
                            </button>
                        </div>

                        <input type="hidden" name="images" value={JSON.stringify(images)} />

                        {images.length > 0 && (
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square bg-muted rounded-sm border border-border overflow-hidden group">
                                        <Image src={img} alt="Product" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleImageDelete(i)}
                                            className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border border-dashed border-border rounded-sm p-10 text-center hover:bg-muted/30 transition-colors cursor-pointer group">
                            {/* Temporary fallback input for images if UploadThing is not fully set up */}
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="p-4 bg-muted/50 rounded-full group-hover:scale-110 transition-transform">
                                    <Upload className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/70">Upload Images</p>
                                    <p className="text-[10px] text-muted-foreground">Drag & drop or click to select</p>
                                </div>
                                <div onClick={(e) => e.stopPropagation()} className="mt-4 flex gap-2 w-full max-w-xs mx-auto">
                                    <Input
                                        placeholder="Or paste image URL..."
                                        className="h-8 text-xs border-border"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = (e.currentTarget as HTMLInputElement).value;
                                                if (val) {
                                                    setImages([...images, val]);
                                                    (e.currentTarget as HTMLInputElement).value = '';
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Organization */}
                <div className="space-y-8">
                    <div className="bg-card border border-border p-6 rounded-sm space-y-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50 mb-4 border-b border-border pb-2">Status</h3>

                        <div className="space-y-2">
                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Publication</Label>
                            <Select name="status" defaultValue={initialData?.status || "draft"}>
                                <SelectTrigger className="h-10 border-border">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover text-popover-foreground border-border">
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between pt-4 bg-muted/30 p-4 rounded-sm border border-border">
                            <div className="space-y-0.5">
                                <Label className="uppercase text-xs tracking-widest text-foreground/80">Featured</Label>
                                <p className="text-[10px] text-muted-foreground">Highlight in store</p>
                            </div>
                            <Switch
                                name="isFeatured"
                                checked={isFeatured}
                                onCheckedChange={setIsFeatured}
                            />
                        </div>
                    </div>

                    <div className="bg-card border border-border p-6 rounded-sm space-y-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50 mb-4 border-b border-border pb-2">Details</h3>

                        <div className="space-y-2">
                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Category</Label>
                            <Select
                                name="category"
                                defaultValue={initialData?.categoryId}
                                onValueChange={(val) => setProdCategory(val)}
                            >
                                <SelectTrigger className="h-10 border-border">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover text-popover-foreground border-border">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Price ($)</Label>
                            <Input
                                name="price"
                                type="number"
                                required
                                defaultValue={initialData?.price}
                                className="font-mono h-10 border-border"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">Stock</Label>
                                <Input name="stockQuantity" type="number" placeholder="0" defaultValue={initialData?.stockQuantity} className="h-10 border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">Weight (g)</Label>
                                <Input name="weight" type="number" placeholder="0" defaultValue={initialData?.weight} className="h-10 border-border" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
