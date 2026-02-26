"use client";

import { updateCampaign } from "@/app/store/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ChevronLeft, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { UploadDropzone } from "@/lib/uploadthing";
import { useActionState, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
}

interface CampaignProduct {
    productId: string;
    order: number;
    badge: string | null;
    highlightText: string | null;
    product: Product;
}

interface Campaign {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    status: string;
    startDate: string | null;
    endDate: string | null;
    heroImage: string | null;
    mobileHeroImage: string | null;
    theme: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    products: CampaignProduct[];
}

function SubmitBtn() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="bg-white text-black hover:bg-gray-200 uppercase tracking-widest">
            {pending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Save Changes
        </Button>
    );
}

export function EditCampaignForm({ campaign, products }: { campaign: Campaign; products: Product[] }) {
    const [image, setImage] = useState<string | null>(campaign.heroImage);
    const [mobileImage, setMobileImage] = useState<string | null>(campaign.mobileHeroImage);
    const [selectedProducts, setSelectedProducts] = useState<string[]>(
        campaign.products.map((cp) => cp.productId)
    );
    const [productDetails, setProductDetails] = useState<Record<string, { badge: string; highlightText: string }>>(
        campaign.products.reduce((acc, cp) => {
            acc[cp.productId] = {
                badge: cp.badge || "",
                highlightText: cp.highlightText || "",
            };
            return acc;
        }, {} as Record<string, { badge: string; highlightText: string }>)
    );
    const [themeJson, setThemeJson] = useState(campaign.theme ? JSON.stringify(campaign.theme, null, 2) : "");
    const [metadataJson, setMetadataJson] = useState(campaign.metadata ? JSON.stringify(campaign.metadata, null, 2) : "");
    const [status, setStatus] = useState(campaign.status);
    const [startDate, setStartDate] = useState(campaign.startDate ? new Date(campaign.startDate).toISOString().split("T")[0] : "");
    const [endDate, setEndDate] = useState(campaign.endDate ? new Date(campaign.endDate).toISOString().split("T")[0] : "");
    const [, action] = useActionState(updateCampaign, undefined);

    const toggleProduct = (id: string) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter((p) => p !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const setProductDetail = (productId: string, field: "badge" | "highlightText", value: string) => {
        setProductDetails((prev) => ({
            ...prev,
            [productId]: { ...(prev[productId] ?? { badge: "", highlightText: "" }), [field]: value },
        }));
    };

    const selectedProductDetailsPayload = selectedProducts.map((id, index) => ({
        id,
        order: index,
        badge: productDetails[id]?.badge ?? null,
        highlightText: productDetails[id]?.highlightText ?? null,
    }));

    return (
        <form action={action}>
            <input type="hidden" name="campaignId" value={campaign.id} />
            <input type="hidden" name="status" value={status} />
            <input type="hidden" name="startDate" value={startDate} />
            <input type="hidden" name="endDate" value={endDate} />
            <input type="hidden" name="mobileHeroImage" value={mobileImage ?? ""} />
            <input type="hidden" name="theme" value={themeJson || ""} />
            <input type="hidden" name="metadata" value={metadataJson || ""} />
            <input type="hidden" name="selectedProductDetails" value={JSON.stringify(selectedProductDetailsPayload)} />
            <input type="hidden" name="selectedProducts" value={JSON.stringify(selectedProducts)} />
            <input type="hidden" name="imageString" value={image || ""} />

            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/campaigns">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-light uppercase tracking-widest">Edit Campaign</h1>
                <span className="text-xs font-mono text-muted-foreground ml-auto">/{campaign.slug}</span>
            </div>

            <Card className="mt-5 bg-white/5 border-white/10 backdrop-blur-sm text-white">
                <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                    <CardDescription className="text-white/50">Update campaign settings and products</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Title</Label>
                                <Input name="title" required defaultValue={campaign.title} className="bg-black/20 border-white/10 text-white" />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Slug (auto-generated)</Label>
                                <Input disabled value={campaign.slug} className="bg-white/5 border-white/10 text-white/30" />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/90 border-white/10">
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Start Date</Label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white" />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">End Date</Label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-black/20 border-white/10 text-white" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Description</Label>
                            <Textarea name="description" defaultValue={campaign.description || ""} className="bg-black/20 border-white/10 text-white min-h-[100px]" />
                        </div>

                        {/* Hero Image */}
                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Hero Image</Label>
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
                                    onClientUploadComplete={(res: { url: string }[]) => setImage(res[0].url)}
                                    onUploadError={() => alert("Error uploading image")}
                                />
                            )}
                        </div>

                        {/* Mobile Hero */}
                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Mobile Hero Image (optional)</Label>
                            {mobileImage ? (
                                <div className="relative w-full h-[200px] rounded-lg border border-white/10 overflow-hidden group">
                                    <Image src={mobileImage} alt="Mobile Hero" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => setMobileImage(null)} className="bg-red-500 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-red-600">Remove</button>
                                    </div>
                                </div>
                            ) : (
                                <UploadDropzone
                                    className="ut-label:text-white/70 ut-button:bg-white/10 ut-button:text-white ut-button:hover:bg-white/20 border-white/10 bg-black/20"
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res: { url: string }[]) => setMobileImage(res[0].url)}
                                    onUploadError={() => alert("Error uploading image")}
                                />
                            )}
                        </div>

                        {/* Theme & Metadata JSON */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Theme (JSON optional)</Label>
                                <Textarea
                                    placeholder='{"backgroundColor":"#000","accentColor":"#fff","fontColor":"#fff"}'
                                    value={themeJson}
                                    onChange={(e) => setThemeJson(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white font-mono text-xs min-h-[80px]"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Metadata (JSON optional)</Label>
                                <Textarea
                                    placeholder='{"seoTitle":"","seoDescription":"","ogImage":""}'
                                    value={metadataJson}
                                    onChange={(e) => setMetadataJson(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white font-mono text-xs min-h-[80px]"
                                />
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Select Products ({selectedProducts.length})</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-4 bg-black/20 rounded-md border border-white/10">
                                {products.map((product) => (
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

                        {selectedProducts.length > 0 && (
                            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Featured product details (optional)</Label>
                                <div className="space-y-4">
                                    {selectedProducts.map((productId) => {
                                        const product = products.find((p) => p.id === productId);
                                        return (
                                            <div key={productId} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-black/20 rounded-md border border-white/10">
                                                <span className="text-white/80 text-sm font-medium md:col-span-1">{product?.name ?? productId}</span>
                                                <Input
                                                    placeholder="Badge (e.g. New)"
                                                    value={productDetails[productId]?.badge ?? ""}
                                                    onChange={(e) => setProductDetail(productId, "badge", e.target.value)}
                                                    className="bg-black/20 border-white/10 text-white text-sm"
                                                />
                                                <Input
                                                    placeholder="Highlight text"
                                                    value={productDetails[productId]?.highlightText ?? ""}
                                                    onChange={(e) => setProductDetail(productId, "highlightText", e.target.value)}
                                                    className="bg-black/20 border-white/10 text-white text-sm"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitBtn />
                </CardFooter>
            </Card>
        </form>
    );
}
