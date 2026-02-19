"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProfileSchema, updateUserProfile } from "@/app/store/user-actions";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type ProfileFormValues = z.infer<typeof ProfileSchema>;

interface ProfileFormProps {
    initialData: {
        firstName: string;
        lastName: string;
        email: string; // Read-only
        socialTitle?: string | null;
        birthdate?: Date | null;
        newsletter?: boolean;
    };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(ProfileSchema) as any,
        defaultValues: {
            firstName: initialData.firstName,
            lastName: initialData.lastName,
            socialTitle: (initialData.socialTitle as any) || undefined,
            birthdate: initialData.birthdate ? new Date(initialData.birthdate).toISOString().split("T")[0] : "",
            newsletter: initialData.newsletter || false,
        },
    });

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true);
        try {
            await updateUserProfile(data);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Social Title */}
            <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Social Title
                </label>
                <div className="flex gap-6">
                    {["Mr.", "Mrs."].map((title) => (
                        <label key={title} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value={title}
                                {...form.register("socialTitle")}
                                className="accent-accent w-4 h-4"
                            />
                            <span className="text-sm font-light">{title}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        First Name
                    </label>
                    <input
                        {...form.register("firstName")}
                        className="w-full bg-transparent border-b border-border py-2 text-lg focus:outline-none focus:border-foreground transition-colors"
                        placeholder="First Name"
                    />
                    {form.formState.errors.firstName && (
                        <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Last Name
                    </label>
                    <input
                        {...form.register("lastName")}
                        className="w-full bg-transparent border-b border-border py-2 text-lg focus:outline-none focus:border-foreground transition-colors"
                        placeholder="Last Name"
                    />
                    {form.formState.errors.lastName && (
                        <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>
                    )}
                </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Email
                </label>
                <input
                    value={initialData.email}
                    readOnly
                    className="w-full bg-transparent border-b border-border py-2 text-lg text-muted-foreground cursor-not-allowed focus:outline-none"
                    title="Managed via login provider"
                />
            </div>

            {/* Password (Placeholder link) */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Password
                </label>
                <div className="flex items-center justify-between border-b border-border py-2">
                    <span className="text-lg text-muted-foreground">********</span>
                    <span className="text-xs text-muted-foreground italic">(Managed via secure login)</span>
                </div>
            </div>


            {/* Birthdate */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Birthdate
                </label>
                <input
                    type="date"
                    {...form.register("birthdate")}
                    className="w-full bg-transparent border-b border-border py-2 text-lg focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
                    placeholder="MM/DD/YYYY"
                />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Optional</p>
            </div>

            {/* Terms & Newsletter */}
            <div className="space-y-4 pt-4 border-t border-border">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        // This is purely cosmetic as requested by design, usually required for signup not profile edit
                        defaultChecked
                        disabled
                        className="mt-1 accent-accent"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        I agree to the Terms and Conditions and Privacy Policy.
                    </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        {...form.register("newsletter")}
                        className="mt-1 accent-accent"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                            Sign up for our newsletter
                        </span>
                        <span className="text-xs text-muted-foreground">
                            You may unsubscribe at any moment. For that purpose, please find our contact info in the legal notice.
                        </span>
                    </div>

                </label>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="bg-foreground text-background px-8 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
            </button>
        </form>
    );
}
