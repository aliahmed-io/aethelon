import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";

export const metadata = {
    title: "My Collection | Aethelon",
    description: "Your digital portfolio of acquired pieces.",
};

export default async function VaultPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    interface FurnitureItem {
        id: string;
        orderId: string;
        name: string;
        images: string[];
        mainCategory: string;
        acquiredDate: string | Date;
    }

    // Mock data for build
    const allItems: FurnitureItem[] = [];
    const totalAssetValue = 0;
    const totalAcquisitions = 0;

    return (
        <div className="bg-background min-h-screen text-foreground pb-20 selection:bg-accent/30">

            <div className="pt-32 container mx-auto px-6 lg:px-12">

                {/* 1. Portfolio Header */}
                <div className="border-b border-border pb-12 mb-16">
                    <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
                                <Lock className="w-4 h-4 text-accent" />
                                <span className="text-xs font-mono uppercase tracking-[0.2em] text-accent">Secure Portfolio</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-light tracking-tight mb-2 uppercase opacity-0 animate-[slideUp_0.8s_ease-out_0.1s_forwards]">
                                My Collection
                            </h1>
                            <p className="text-muted-foreground font-mono text-sm tracking-widest pl-1 opacity-0 animate-[slideUp_0.8s_ease-out_0.2s_forwards]">
                                PRIVATE ASSET VAULT • {user?.email || "Guest"}
                            </p>
                        </div>

                        {allItems.length > 0 && (
                            <div className="flex gap-12 text-right opacity-0 animate-[fadeIn_1s_ease-out_0.4s_forwards]">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Acquisitions</p>
                                    <p className="text-3xl font-light">{totalAcquisitions.toString().padStart(2, '0')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Portfolio Value</p>
                                    <p className="text-3xl font-light text-accent">{formatPrice(totalAssetValue)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. The Collection Grid */}
                {allItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allItems.map((item: { id: string; orderId: string; name: string; images: string[]; mainCategory: string; acquiredDate: string | Date }, idx: number) => (
                            <Link
                                href={`/account/orders/${item.orderId}`}
                                key={`${item.id}-${idx}`}
                                className="group relative aspect-[4/5] bg-muted border border-border rounded-sm overflow-hidden hover:border-accent/30 transition-all duration-500"
                            >
                                {/* Item Image */}
                                <div className="absolute inset-0 p-8 flex items-center justify-center bg-gradient-to-b from-foreground/[0.02] to-transparent">
                                    <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out">
                                        {item.images && item.images[0] && (
                                            <Image
                                                src={item.images[0]}
                                                alt={item.name || "Furniture"}
                                                fill
                                                className="object-contain drop-shadow-2xl"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Overlay Info */}
                                <div className="absolute inset-0 flex flex-col justify-between p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-accent/10 border border-accent/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                                            <ShieldCheck className="w-3 h-3 text-accent" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Authenticated</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                            {new Date(item.acquiredDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="bg-background/90 backdrop-blur-xl border-t border-border -mx-6 -mb-6 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-lg font-medium text-foreground mb-1">{item.name}</h3>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{item.mainCategory || "Furniture"}</p>
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent border-b border-accent hover:border-transparent w-fit transition-colors pb-0.5">
                                            View Provenance <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Empty "Allocation" Slots to fill grid */}
                        {Array.from({ length: Math.max(0, 3 - (allItems.length % 3)) }).map((_, i) => (
                            (allItems.length % 3 !== 0) && (
                                <div key={`empty-${i}`} className="aspect-[4/5] border border-border bg-muted/30 rounded-sm flex flex-col items-center justify-center opacity-50">
                                    <div className="w-16 h-16 border border-border rounded-full flex items-center justify-center mb-4">
                                        <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                    </div>
                                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/40 cursor-default">Open Slot</p>
                                </div>
                            )
                        ))}


                    </div>
                ) : (
                    /* 3. Empty State ("The Invitation") */
                    <div className="min-h-[50vh] flex flex-col items-center justify-center border border-border rounded-sm bg-muted/30 backdrop-blur-sm relative overflow-hidden">
                        {/* Background mesh/grid effect */}
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

                        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-accent/10 to-transparent flex items-center justify-center mb-8 border border-border shadow-2xl relative">
                            <div className="absolute inset-0 rounded-full border border-accent/20 animate-[ping_3s_linear_infinite]" />
                            <Lock className="w-8 h-8 text-muted-foreground" />
                        </div>

                        <h2 className="text-2xl font-light tracking-wide mb-3 uppercase">Portfolio Empty</h2>
                        <p className="text-muted-foreground max-w-md text-center mb-10 font-light leading-relaxed">
                            Your secure digital vault is initialized and ready for deposits.
                            Acquired pieces will be automatically authenticated and stored here.
                        </p>

                        <Link href="/shop" className="group relative px-8 py-4 bg-accent text-accent-foreground overflow-hidden rounded-sm hover:scale-105 transition-transform duration-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <span className="relative flex items-center gap-3 font-bold text-xs uppercase tracking-[0.2em]">
                                Explore Collection
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
