"use client";

import { createBanner } from "@/app/store/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { UploadDropzone } from "@/lib/uploadthing";
import { useActionState, useState } from "react";
import Image from "next/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Campaign {
    id: string;
    title: string;
}

function SubmitBtn() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="bg-white text-black hover:bg-gray-200 uppercase tracking-widest">
            {pending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            Create Banner
        </Button>
    )
}

export function CreateBannerForm({ campaigns }: { campaigns: Campaign[] }) {
    const [image, setImage] = useState<string | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<string>("");
    const [, action] = useActionState(createBanner, undefined);

    return (
        <form action={action}>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/banner">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-light uppercase tracking-widest">New Banner</h1>
            </div>

            <Card className="mt-5 bg-white/5 border-white/10 backdrop-blur-sm text-white">
                <CardHeader>
                    <CardTitle>Banner Details</CardTitle>
                    <CardDescription className="text-white/50">Create a new banner for your homepage</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Title</Label>
                            <Input name="title" required placeholder="Banner Title" className="bg-black/20 border-white/10 text-white" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Link to Campaign (Optional)</Label>
                                <Select name="campaignId" onValueChange={setSelectedCampaign}>
                                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                        <SelectValue placeholder="Select a campaign" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Custom Link)</SelectItem>
                                        {campaigns.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Label className="uppercase text-xs tracking-widest text-white/50">Custom Link (URL)</Label>
                                <Input
                                    name="link"
                                    placeholder="e.g. /collections"
                                    className="bg-black/20 border-white/10 text-white disabled:opacity-50"
                                    disabled={!!selectedCampaign && selectedCampaign !== "none"}
                                />
                                {selectedCampaign && selectedCampaign !== "none" && (
                                    <p className="text-[10px] text-amber-400">Linked to campaign. URL will be auto-generated.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label className="uppercase text-xs tracking-widest text-white/50">Image</Label>
                            <input type="hidden" name="imageString" value={image || ""} />
                            {image ? (
                                <div className="relative w-[200px] h-[200px] rounded-lg border border-white/10 overflow-hidden">
                                    <Image src={image} alt="Banner Preview" fill className="object-cover" />
                                    <button type="button" onClick={() => setImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-sm text-xs">Remove</button>
                                </div>
                            ) : (
                                <UploadDropzone
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res: any) => {
                                        setImage(res[0].url);
                                    }}
                                    onUploadError={() => {
                                        alert("Error uploading image");
                                    }}
                                />
                            )}
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
