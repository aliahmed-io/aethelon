import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "@/lib/db";
import { Prisma } from "@prisma/client";
import { Navbar } from "@/app/components/Navbar";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";

// Re-exporting modules to fix type issues if necessary
// This is a server component

export const metadata = {
    title: "My Collection | Velorum",
    description: "Your digital portfolio of acquired timepieces.",
};

type OrderWithItems = Prisma.OrderGetPayload<{
    include: {
        orderItems: {
            include: {
                product: true
            }
        }
    }
}>;

export default async function VaultPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        redirect("/api/auth/login");
    }

    // Fetch DELIVERED orders for the portfolio
    // We treat 'delivered' orders as "Assets in the Vault"
    const orders = (await prismadb.order.findMany({
        where: {
            userId: user.id,
            status: "delivered", // ONLY delivered items go in the vault
        },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })) as OrderWithItems[];

    // Calculate Portfolio Value
    const totalAssetValue = orders.reduce((sum, order) => {
        // Summing up order totals (which includes all items + shipping/tax)
        // Or strictly product value? Let's do Order Total for now as "Cost Basis"
        return sum + order.amount;
    }, 0);

    const totalAcquisitions = orders.length;

    // Flatten items for display if needed, but keeping them grouped by order is better for "Provenance"
    // Actually, a "Watch Box" usually shows individual watches.
    // Let's flatten to show individual Timepieces.
    const allTimepieces = orders.flatMap((order) =>
        order.orderItems.map((item) => ({
            ...item.product,
            acquiredDate: order.createdAt,
            orderId: order.id
        }))
    );

    return (
        <div className="bg-[#050505] min-h-screen text-white pb-20 selection:bg-emerald-500/30">
            <Navbar />

            <div className="pt-32 container mx-auto px-6 lg:px-12">

                {/* 1. Portfolio Header */}
                <div className="border-b border-white/10 pb-12 mb-16">
                    <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
                                <Lock className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-500">Secure Portfolio</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-light tracking-tight mb-2 uppercase opacity-0 animate-[slideUp_0.8s_ease-out_0.1s_forwards]">
                                My Collection
                            </h1>
                            <p className="text-white/40 font-mono text-sm tracking-widest pl-1 opacity-0 animate-[slideUp_0.8s_ease-out_0.2s_forwards]">
                                PRIVATE ASSET VAULT • {user.email}
                            </p>
                        </div>

                        {allTimepieces.length > 0 && (
                            <div className="flex gap-12 text-right opacity-0 animate-[fadeIn_1s_ease-out_0.4s_forwards]">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Acquisitions</p>
                                    <p className="text-3xl font-light">{totalAcquisitions.toString().padStart(2, '0')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Portfolio Value</p>
                                    <p className="text-3xl font-light text-emerald-400">{formatPrice(totalAssetValue)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. The Watch Box Grid */}
                {allTimepieces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allTimepieces.map((watch, idx) => (
                            <Link
                                href={`/account/orders/${watch.orderId}`}
                                key={`${watch.id}-${idx}`}
                                className="group relative aspect-[4/5] bg-[#0a0a0a] border border-white/10 rounded-sm overflow-hidden hover:border-white/30 transition-all duration-500"
                            >
                                {/* Watch Image */}
                                <div className="absolute inset-0 p-8 flex items-center justify-center bg-gradient-to-b from-white/[0.02] to-transparent">
                                    <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out">
                                        {watch.images && watch.images[0] && (
                                            <Image
                                                src={watch.images[0]}
                                                alt={watch.name || "Watch"}
                                                fill
                                                className="object-contain drop-shadow-2xl"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Overlay Info */}
                                <div className="absolute inset-0 flex flex-col justify-between p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Authenticated</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                                            {new Date(watch.acquiredDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 -mx-6 -mb-6 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-lg font-medium text-white mb-1">{watch.name}</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">{watch.mainCategory || "Timepiece"}</p>
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white border-b border-white hover:border-transparent w-fit transition-colors pb-0.5">
                                            View Provenance <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Empty "Allocation" Slots to fill grid? Optional, fits the 'Box' vibe */}
                        {Array.from({ length: Math.max(0, 3 - (allTimepieces.length % 3)) }).map((_, i) => (
                            (allTimepieces.length % 3 !== 0) && (
                                <div key={`empty-${i}`} className="aspect-[4/5] border border-white/5 bg-white/[0.01] rounded-sm flex flex-col items-center justify-center opacity-50">
                                    <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mb-4">
                                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                                    </div>
                                    <p className="text-xs font-mono uppercase tracking-widest text-white/20 cursor-default">Open Slot</p>
                                </div>
                            )
                        ))}

                    </div>
                ) : (
                    /* 3. Empty State ("The Invitation") */
                    <div className="min-h-[50vh] flex flex-col items-center justify-center border border-white/5 rounded-sm bg-white/[0.02] backdrop-blur-sm relative overflow-hidden">
                        {/* Background mesh/grid effect */}
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

                        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center mb-8 border border-white/5 shadow-2xl relative">
                            <div className="absolute inset-0 rounded-full border border-white/10 animate-[ping_3s_linear_infinite]" />
                            <Lock className="w-8 h-8 text-white/20" />
                        </div>

                        <h2 className="text-2xl font-light tracking-wide mb-3 uppercase">Portfolio Empty</h2>
                        <p className="text-white/40 max-w-md text-center mb-10 font-light leading-relaxed">
                            Your secure digital vault is initialized and ready for deposits.
                            <br />Acquired timepieces will be automatically authenticated and stored here.
                        </p>

                        <Link href="/shop" className="group relative px-8 py-4 bg-white text-black overflow-hidden rounded-sm hover:scale-105 transition-transform duration-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
