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
        costPrice?: number;
        brand?: string | null;
        modelUrl?: string | null;
        usdzUrl?: string | null;
        color?: string | null;
        style?: string | null;
        height?: string | null;
        pattern?: string | null;
        tags?: string[];
        features?: string[];
        sizes?: string[];
        imageDescription?: string | null;
        discountPercentage?: number;
        lowStockThreshold?: number;
        allowBackorder?: boolean;
        backorderLimit?: number;
        mainCategory?: string;
        variants?: {
            id: string;
            colorName: string;
            colorHex: string;
            images: string[];
        }[];
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
    const [variants, setVariants] = useState<{ id: string; colorName: string; colorHex: string; images: string[] }[]>(initialData?.variants?.map(v => ({ ...v, id: v.id || crypto.randomUUID() })) || []);
    const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);
    const [allowBackorder, setAllowBackorder] = useState<boolean>(initialData?.allowBackorder ?? false);

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
            <input type="hidden" name="variants" value={JSON.stringify(variants)} />

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

                    <div className="bg-card border border-border p-8 rounded-sm space-y-8 relative overflow-hidden shadow-sm">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Color Variants</h3>
                                <button
                                    type="button"
                                    onClick={() => setVariants([...variants, { id: crypto.randomUUID(), colorName: "", colorHex: "#000000", images: [] }])}
                                    className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                    + Add Variant
                                </button>
                            </div>

                            {variants.map((v, idx) => (
                                <div key={v.id} className="p-4 border border-border rounded-sm bg-muted/20 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/70">Variant {idx + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Color Name</Label>
                                            <Input
                                                value={v.colorName}
                                                onChange={(e) => {
                                                    const newVariants = [...variants];
                                                    newVariants[idx].colorName = e.target.value;
                                                    setVariants(newVariants);
                                                }}
                                                placeholder="e.g. Midnight Blue"
                                                className="h-10 border-border"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Hex Code</Label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={v.colorHex}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[idx].colorHex = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    className="w-10 h-10 border-0 p-0 rounded-sm cursor-pointer"
                                                />
                                                <Input
                                                    value={v.colorHex}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[idx].colorHex = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    placeholder="#000000"
                                                    className="h-10 border-border uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase text-xs tracking-widest text-muted-foreground">Images (URLs)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {v.images.map((img, iIndex) => (
                                                <div key={iIndex} className="relative aspect-square w-16 bg-muted rounded-sm border border-border overflow-hidden group">
                                                    <Image src={img} alt="Variant" fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newVariants = [...variants];
                                                            newVariants[idx].images = newVariants[idx].images.filter((_, i) => i !== iIndex);
                                                            setVariants(newVariants);
                                                        }}
                                                        className="absolute top-0 right-0 p-0.5 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            <Input
                                                placeholder="Paste image URL and enter"
                                                className="h-8 text-xs border-border flex-1 min-w-[200px]"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = (e.currentTarget as HTMLInputElement).value;
                                                        if (val) {
                                                            const newVariants = [...variants];
                                                            newVariants[idx].images.push(val);
                                                            setVariants(newVariants);
                                                            (e.currentTarget as HTMLInputElement).value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {variants.length === 0 && (
                                <p className="text-xs text-muted-foreground italic">No variants added. Product will just use the default media assets below.</p>
                            )}
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

                        <div className="space-y-2">
                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Image Description (ALT)</Label>
                            <Textarea
                                name="imageDescription"
                                placeholder="Accessibility description for product images"
                                defaultValue={initialData?.imageDescription ?? ""}
                                className="min-h-[60px] border-border resize-none text-sm"
                            />
                        </div>

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
                            <input type="hidden" name="isFeatured" value={isFeatured ? "on" : "off"} />
                            <Switch
                                checked={isFeatured}
                                onCheckedChange={setIsFeatured}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Main Category</Label>
                            <Select name="mainCategory" defaultValue={initialData?.mainCategory || "MEN"}>
                                <SelectTrigger className="h-10 border-border">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover text-popover-foreground border-border">
                                    <SelectItem value="MEN">Men</SelectItem>
                                    <SelectItem value="WOMEN">Women</SelectItem>
                                    <SelectItem value="KIDS">Kids</SelectItem>
                                </SelectContent>
                            </Select>
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

                        <div className="space-y-2">
                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Discount %</Label>
                            <Input
                                name="discountPercentage"
                                type="number"
                                min={0}
                                max={100}
                                defaultValue={initialData?.discountPercentage ?? 0}
                                className="font-mono h-10 border-border"
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Cost Price (Cents)</Label>
                            <Input
                                name="costPrice"
                                type="number"
                                required
                                defaultValue={initialData?.costPrice || 0}
                                className="font-mono h-10 border-border"
                                placeholder="0"
                            />
                            <p className="text-[10px] text-muted-foreground">Internal cost in cents (e.g., 1500 = $15.00)</p>
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

                        <div className="space-y-2">
                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Low Stock Threshold</Label>
                            <Input name="lowStockThreshold" type="number" min={0} defaultValue={initialData?.lowStockThreshold ?? 5} className="h-10 border-border" placeholder="5" />
                        </div>

                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-sm border border-border">
                            <div className="space-y-0.5">
                                <Label className="uppercase text-xs tracking-widest text-foreground/80">Allow Backorder</Label>
                                <p className="text-[10px] text-muted-foreground">Sell when out of stock</p>
                            </div>
                            <input type="hidden" name="allowBackorder" value={allowBackorder ? "on" : "off"} />
                            <Switch checked={allowBackorder} onCheckedChange={setAllowBackorder} />
                        </div>

                        {allowBackorder && (
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">Backorder Limit</Label>
                                <Input name="backorderLimit" type="number" min={0} defaultValue={initialData?.backorderLimit ?? 0} className="h-10 border-border" placeholder="0" />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="uppercase text-xs tracking-widest text-muted-foreground">Brand</Label>
                            <Input name="brand" placeholder="Brand Name" defaultValue={initialData?.brand || "Generic"} className="h-10 border-border" />
                        </div>

                        <div className="pt-4 border-t border-border space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/70">Filterable / discovery</h4>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">Color</Label>
                                <Input name="color" placeholder="e.g. Navy" defaultValue={initialData?.color ?? ""} className="h-10 border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">Style</Label>
                                <Input name="style" placeholder="e.g. Modern" defaultValue={initialData?.style ?? ""} className="h-10 border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">Height</Label>
                                <Input name="height" placeholder="e.g. 32 in" defaultValue={initialData?.height ?? ""} className="h-10 border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">Pattern</Label>
                                <Input name="pattern" placeholder="e.g. Solid" defaultValue={initialData?.pattern ?? ""} className="h-10 border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">Tags (comma-separated)</Label>
                                <Input name="tags" placeholder="outdoor, sale, new" defaultValue={initialData?.tags?.join(", ") ?? ""} className="h-10 border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">Features (comma-separated)</Label>
                                <Input name="features" placeholder="Eco-friendly, Handcrafted" defaultValue={initialData?.features?.join(", ") ?? ""} className="h-10 border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">Sizes (comma-separated)</Label>
                                <Input name="sizes" placeholder="S, M, L, XL" defaultValue={initialData?.sizes?.join(", ") ?? ""} className="h-10 border-border" />
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-border">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/70 mb-2">3D Models</h4>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">GLB Model URL</Label>
                                <Input name="modelUrl" placeholder="https://..." defaultValue={initialData?.modelUrl || ""} className="h-10 border-border font-mono text-[10px]" />
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs tracking-widest text-muted-foreground">USDZ Model URL (iOS AR)</Label>
                                <Input name="usdzUrl" placeholder="https://..." defaultValue={initialData?.usdzUrl || ""} className="h-10 border-border font-mono text-[10px]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
