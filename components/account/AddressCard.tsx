"use client";

import { useTransition } from "react";
import { deleteAddress, setDefaultAddress } from "@/app/store/user-actions";
import { toast } from "sonner";
import { Loader2, Trash2, Edit } from "lucide-react";
import { Address } from "@prisma/client";

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
}

export function AddressCard({ address, onEdit }: AddressCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        startTransition(async () => {
            try {
                await deleteAddress(address.id);
                toast.success("Address deleted");
            } catch (e) {
                toast.error("Failed to delete address");
            }
        });
    };

    const handleSetDefault = () => {
        if (address.isDefault) return;

        startTransition(async () => {
            try {
                await setDefaultAddress(address.id);
                toast.success("Default address updated");
            } catch (e) {
                toast.error("Failed to update default address");
            }
        });
    };

    return (
        <div className={`p-6 border rounded-sm space-y-3 relative group transition-all ${address.isDefault ? 'border-accent bg-accent/5' : 'border-border'}`}>
            {/* Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(address)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    title="Edit"
                >
                    <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors"
                    title="Delete"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider">{address.name}</h3>
                {address.isDefault && (
                    <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                        Default
                    </span>
                )}
            </div>

            <div className="text-sm text-muted-foreground space-y-0.5">
                <p>{address.street1}</p>
                {address.street2 && <p>{address.street2}</p>}
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
                {address.phone && <p className="mt-2 text-xs">{address.phone}</p>}
            </div>

            {!address.isDefault && (
                <button
                    onClick={handleSetDefault}
                    disabled={isPending}
                    className="text-xs text-accent hover:underline mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    Set as default
                </button>
            )}
        </div>
    );
}
