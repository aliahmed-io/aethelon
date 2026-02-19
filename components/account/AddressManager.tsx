"use client";

import { useState } from "react";
import { AddressCard } from "./AddressCard";
import { AddressForm } from "./AddressForm";
import { Plus } from "lucide-react";

import { Address } from "@prisma/client";

interface AddressManagerProps {
    addresses: any[];
}

export function AddressManager({ addresses }: AddressManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any | null>(null);

    // If editing, show form
    if (editingAddress) {
        return (
            <AddressForm
                initialData={editingAddress}
                onClose={() => setEditingAddress(null)}
            />
        );
    }

    // If adding, show form
    if (isAdding) {
        return (
            <AddressForm
                onClose={() => setIsAdding(false)}
            />
        );
    }

    // List view
    return (
        <div className="space-y-6">
            {addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-sm">
                    <h3 className="text-lg font-light mb-4">No saved addresses</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mb-6">
                        Add an address to speed up checkout.
                    </p>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-foreground text-background px-6 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Address
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                            <AddressCard
                                key={addr.id}
                                address={addr}
                                onEdit={(address) => setEditingAddress(address)}
                            />
                        ))}
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={() => setIsAdding(true)}
                            className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-accent transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Another Address
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
