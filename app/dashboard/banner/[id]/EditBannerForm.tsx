"use client";

import { updateBanner } from "@/app/store/actions";
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
import { UploadDropzone } from "@/lib/uploadthing";
import { useActionState, useState } from "react";
import Image from "next/image";

interface Banner {
    id: string;
    title: string;
    imageString: string;
    link: string;
    campaignId: string | null;
}

interface Campaign {
    id: string;
    title: string;
    slug: string;
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

export function EditBannerForm({ banner, campaigns }: { banner: Banner; campaigns: Campaign[] }) {
    const [image, setImage] = useState<string>(banner.imageString);
    const [campaignId, setCampaignId] = useState<string>(banner.campaignId || "none");
    const [, action] = useActionState(updateBanner, undefined);

    return (
        <form action={action}>
            <input type="hidden" name="bannerId" value={banner.id} />
            <input type="hidden" name="imageString" value={image} />
            <input type="hidden" name="campaignId" value={campaignId === "none" ? "" : campaignId} />

            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/banner">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-light uppercase tracking-widest">Edit Banner</h1>
            </div>

            <Card className="mt-5 bg-white/5 border-white/10 backdrop-blur-sm text-white">
                <CardHeader>
                    <CardTitle>Banner Details</CardTitle>
                    <CardDescription className="text-white/50">Update banner content and targeting</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Title</Label>
                            <Input name="title" required defaultValue={banner.title} className="bg-black/20 border-white/10 text-white" />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Link (URL)</Label>
                                <Input name="link" defaultValue={banner.link} placeholder="/" className="bg-black/20 border-white/10 text-white" />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Link to Campaign (optional)</Label>
                                <Select value={campaignId} onValueChange={setCampaignId}>
                                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/90 border-white/10">
                                        <SelectItem value="none">No Campaign</SelectItem>
                                        {campaigns.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Banner Image</Label>
                            {image ? (
                                <div className="relative w-full h-[250px] rounded-lg border border-white/10 overflow-hidden group">
                                    <Image src={image} alt="Banner" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => setImage("")} className="bg-red-500 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-red-600">Replace Image</button>
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
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitBtn />
                </CardFooter>
            </Card>
        </form>
    );
}
