"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";
import { Loader2, Send, X, Check, ChevronsUpDown, Sparkles } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

interface EmailComposerProps {
    users: User[];
}

export function EmailComposer({ users }: EmailComposerProps) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [aiContext, setAiContext] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Restore missing state
    const [isLoading, setIsLoading] = useState(false);
    const [audience, setAudience] = useState("all");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    async function handleGenerate() {
        if (!aiContext.trim()) {
            toast.error("Please enter a theme or context for the AI.");
            return;
        }
        setIsGenerating(true);
        try {
            const res = await fetch("/api/email/ai-draft", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ context: aiContext }),
            });

            const data = await res.json();

            if (res.ok && data.success && data.draft) {
                setSubject(data.draft.subject);
                setMessage(data.draft.message);
                toast.success("AI drafted your campaign!");
            } else {
                toast.error(data.error || "Failed to generate content");
            }
        } catch (error: any) {
            console.error("AI generate error", error);
            toast.error("Failed to generate content");
        }
        setIsGenerating(false);
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);

        // Append image URL if exists
        if (imageUrl) {
            formData.append("imageUrl", imageUrl);
        }

        // Append audience
        formData.append("audience", audience);

        // Append specific emails if audience is specific
        if (audience === "specific") {
            if (selectedEmails.length === 0) {
                toast.error("Please select at least one recipient");
                setIsLoading(false);
                return;
            }
            formData.append("specificEmails", JSON.stringify(selectedEmails));
        }

        try {
            const res = await fetch("/api/email/broadcast", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || data?.error) {
                toast.error(data?.error || "Failed to send broadcast");
            } else {
                toast.success("Broadcast sent successfully!");
                // Reset form logic
                setAudience("all");
                setImageUrl(null);
                setSelectedEmails([]);
                setSubject("");
                setMessage("");
                setAiContext("");
            }
        } catch (error: any) {
            console.error("Broadcast send error", error);
            toast.error("Failed to send broadcast");
        }

        setIsLoading(false);
    }

    const toggleUser = (email: string) => {
        setSelectedEmails(current =>
            current.includes(email)
                ? current.filter(e => e !== email)
                : [...current, email]
        );
    };

    return (
        <form action={handleSubmit}>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
                {/* Main Content - Left Column (2/3) */}
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                            <CardDescription>
                                Draft your message using AI or write it yourself.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* AI Assistant */}
                            <div className="p-4 bg-muted/50 rounded-lg border border-dashed space-y-3">
                                <Label className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    AI Assistant
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Summer Sale, 20% off new arrivals..."
                                        value={aiContext}
                                        onChange={(e) => setAiContext(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !aiContext}
                                    >
                                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
                                    </Button>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea
                                    name="message"
                                    placeholder="Write your message here..."
                                    className="min-h-[400px] font-mono text-sm"
                                    required
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Markdown and basic formatting supported.
                                </p>
                            </div>

                            {/* Banner Image */}
                            <div className="space-y-2">
                                <Label>Banner Image (Optional)</Label>
                                {imageUrl ? (
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                                        <Image
                                            src={imageUrl}
                                            alt="Email Banner"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setImageUrl(null)}
                                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <UploadDropzone
                                        endpoint="imageUploader"
                                        onClientUploadComplete={(res) => {
                                            setImageUrl(res[0].url);
                                            toast.success("Image uploaded!");
                                        }}
                                        onUploadError={(error: Error) => {
                                            toast.error(`Upload failed: ${error.message}`);
                                        }}
                                        className="ut-label:text-sm ut-allowed-content:text-xs border-dashed border-2 p-8"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                            <CardDescription>
                                Configure delivery options.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Subject */}
                            <div className="space-y-2">
                                <Label>Subject Line</Label>
                                <Input
                                    name="subject"
                                    placeholder="e.g. Big Sale Announcement!"
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            {/* Audience */}
                            <div className="space-y-2">
                                <Label>Audience</Label>
                                <Select value={audience} onValueChange={setAudience} name="audience">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select audience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="newsletter">Newsletter Subscribers</SelectItem>
                                        <SelectItem value="specific">Specific People</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Specific Recipients */}
                            {audience === "specific" && (
                                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                    <Label>Recipients</Label>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={open}
                                                className="w-full justify-between h-auto min-h-[40px]"
                                            >
                                                {selectedEmails.length > 0
                                                    ? `${selectedEmails.length} selected`
                                                    : "Select users..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search users..." />
                                                <CommandList>
                                                    <CommandEmpty>No user found.</CommandEmpty>
                                                    <CommandGroup className="max-h-[200px] overflow-auto">
                                                        {users.map((user) => (
                                                            <CommandItem
                                                                key={user.id}
                                                                value={`${user.firstName} ${user.lastName} ${user.email}`}
                                                                onSelect={() => toggleUser(user.email)}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedEmails.includes(user.email)
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col overflow-hidden">
                                                                    <span className="truncate font-medium">{user.firstName} {user.lastName}</span>
                                                                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {selectedEmails.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2 max-h-[100px] overflow-y-auto p-1 border rounded bg-background">
                                            {selectedEmails.map(email => (
                                                <Badge key={email} variant="secondary" className="flex items-center gap-1 text-[10px]">
                                                    <span className="truncate max-w-[120px]">{email}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleUser(email)}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-4">
                                <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Broadcast
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Double check content before sending.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
