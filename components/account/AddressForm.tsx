"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addressSchema as AddressSchema } from "@/lib/zodSchemas";
import { addAddress, updateAddress } from "@/app/store/user-actions";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Address } from "@prisma/client";

type AddressFormValues = z.infer<typeof AddressSchema>;

interface AddressFormProps {
    initialData?: Address | null;
    onClose: () => void;
}

export function AddressForm({ initialData, onClose }: AddressFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(AddressSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            street1: initialData?.street1 || "",
            street2: initialData?.street2 || "",
            city: initialData?.city || "",
            state: initialData?.state || "",
            postalCode: initialData?.postalCode || "",
            country: initialData?.country || "US",
            phone: initialData?.phone || "",
            isDefault: initialData?.isDefault || false,
        } as any,
    });

    async function onSubmit(data: AddressFormValues) {
        setIsLoading(true);
        try {
            if (initialData) {
                await updateAddress(initialData.id, data);
                toast.success("Address updated");
            } else {
                await addAddress(data);
                toast.success("Address added");
            }
            onClose();
        } catch (error) {
            toast.error("Failed to save address");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-muted/10 p-6 border border-border rounded-sm relative animate-in fade-in slide-in-from-top-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
            >
                <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">
                {initialData ? "Edit Address" : "New Address"}
            </h3>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alias (e.g. Home, Office)</label>
                    <input
                        {...form.register("name")}
                        className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                        placeholder="My Home"
                    />
                    {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Address</label>
                    <input
                        {...form.register("street1")}
                        className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                        placeholder="123 Main St"
                    />
                    {form.formState.errors.street1 && <p className="text-xs text-red-500">{form.formState.errors.street1.message}</p>}

                    <input
                        {...form.register("street2")}
                        className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors mt-2"
                        placeholder="Apt, Suite, Unit (Optional)"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City</label>
                        <input
                            {...form.register("city")}
                            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                        />
                        {form.formState.errors.city && <p className="text-xs text-red-500">{form.formState.errors.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">State</label>
                        <input
                            {...form.register("state")}
                            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                        />
                        {form.formState.errors.state && <p className="text-xs text-red-500">{form.formState.errors.state.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Postal Code</label>
                        <input
                            {...form.register("postalCode")}
                            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                        />
                        {form.formState.errors.postalCode && <p className="text-xs text-red-500">{form.formState.errors.postalCode.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Country</label>
                        <input
                            {...form.register("country")}
                            readOnly
                            className="w-full bg-muted/50 border border-border px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone (Optional)</label>
                    <input
                        {...form.register("phone")}
                        type="tel"
                        className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        {...form.register("isDefault")}
                        className="accent-accent w-4 h-4"
                    />
                    <span className="text-sm">Set as default address</span>
                </label>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs font-bold uppercase tracking-widest hover:underline"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-foreground text-background px-6 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                        Save Address
                    </button>
                </div>
            </form>
        </div>
    );
}
