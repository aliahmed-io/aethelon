import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Metadata, ResolvingMetadata } from "next";
import prisma from "@/lib/db";
import { CurrencyService } from "@/modules/currency/currency.service";
import { VaultActions } from "./VaultActions";

interface Props {
    params: Promise<{ id: string }>;
}

/** Is this product eligible for the Vault? */
function isVaultProduct(p: { isFeatured: boolean; tags: string[] }) {
    return p.isFeatured || p.tags.includes("premium") || p.tags.includes("rare");
}

export async function generateMetadata(
    { params }: Props,
    _parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { id },
        select: { name: true, description: true, images: true },
    });
    if (!product) return { title: "Not Found" };
    const BASE = process.env.NEXT_PUBLIC_URL ?? "https://aethelon.com";
    return {
        title: `${product.name} — The Vault | Aethelon`,
        description: (product.description ?? "").substring(0, 160),
        openGraph: {
            title: `${product.name} — The Vault | Aethelon`,
            images: product.images[0] ? [{ url: product.images[0] }] : [],
            url: `${BASE}/vault/${id}`,
        },
    };
}

export default async function VaultProductPage({ params }: Props) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            images: true,
            features: true,
            tags: true,
            brand: true,
            isFeatured: true,
            stockQuantity: true,
            status: true,
            modelUrl: true,
        },
    });

    if (!product || product.status !== "published") notFound();

    // Non-vault product → redirect to regular shop page
    if (!isVaultProduct(product)) redirect(`/shop/${id}`);

    const currency = await CurrencyService.getCurrency();
    const formatted = CurrencyService.format(product.price, currency);

    const isLimited = product.tags.some((t) =>
        ["limited", "rare", "numbered"].includes(t)
    );
    const edition = product.tags.find((t) => /^\d+\s*\/\s*\d+$/.test(t));

    // Art-direction paragraph — uses product.description as the editorial voice
    const artDirection = product.description ??
        "A singular object, assembled by hand and finished to an exacting standard. Each piece in the Vault is evaluated for material provenance, craft integrity, and scarcity before it is made available.";

    return (
        <div
            className="vault min-h-screen"
            style={{ background: "var(--vault-bg)", color: "var(--vault-fg)" }}
        >
            {/* ── Back navigation ─────────────────────────────────────── */}
            <div
                className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 lg:px-12 py-6"
                style={{ background: "var(--vault-bg)", borderBottom: "1px solid var(--vault-border)" }}
            >
                <Link
                    href="/vault"
                    className="group inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] transition-colors duration-300"
                    style={{ color: "var(--vault-muted)" }}
                >
                    <ChevronLeft className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" />
                    The Vault
                </Link>

                <p
                    className="text-[10px] font-mono uppercase tracking-[0.3em]"
                    style={{ color: "var(--vault-gold)", opacity: 0.7 }}
                >
                    Aethelon
                </p>
            </div>

            <div className="pt-24 pb-32">
                {/* ── Two-column layout ────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">

                    {/* Left — Image (sticky on desktop) */}
                    <div
                        className="lg:sticky lg:top-0 lg:h-screen flex items-center justify-center p-12 lg:p-16"
                        style={{ background: "var(--vault-surface)" }}
                    >
                        <div className="relative w-full aspect-[3/4] max-w-md">
                            <Image
                                src={product.images[0] ?? ""}
                                alt={product.name}
                                fill
                                priority
                                sizes="(min-width: 1024px) 50vw, 100vw"
                                className="object-contain"
                            />

                            {/* Secondary image on hover (if available) */}
                            {product.images[1] && (
                                <Image
                                    src={product.images[1]}
                                    alt={`${product.name} — detail`}
                                    fill
                                    sizes="(min-width: 1024px) 50vw, 100vw"
                                    className="object-contain opacity-0 hover:opacity-100 transition-opacity duration-700 absolute inset-0"
                                />
                            )}
                        </div>
                    </div>

                    {/* Right — Product detail */}
                    <div
                        className="flex flex-col justify-center px-8 lg:px-16 xl:px-20 py-16 lg:py-24 gap-0"
                        style={{ borderLeft: "1px solid var(--vault-border)" }}
                    >

                        {/* ── Provenance row ───────────────────────────────────── */}
                        <div className="flex items-center justify-between mb-8">
                            <p
                                className="text-[9px] font-mono uppercase tracking-[0.3em]"
                                style={{ color: "var(--vault-muted)" }}
                            >
                                {product.brand ?? "Aethelon"} · Vault
                            </p>
                            {(edition ?? isLimited) && (
                                <p
                                    className="text-[9px] font-mono uppercase tracking-[0.3em]"
                                    style={{ color: "var(--vault-gold)" }}
                                >
                                    {edition ?? "Limited"}
                                </p>
                            )}
                        </div>

                        {/* ── Name ─────────────────────────────────────────────── */}
                        <h1
                            className="text-3xl lg:text-5xl font-light tracking-tight uppercase leading-[1.05] mb-6"
                            style={{ color: "var(--vault-fg)" }}
                        >
                            {product.name}
                        </h1>

                        {/* Divider */}
                        <div className="h-px w-full mb-10" style={{ background: "var(--vault-border)" }} />

                        {/* ── Art Direction / Description ──────────────────────── */}
                        <section className="mb-10">
                            <p
                                className="text-[10px] font-mono uppercase tracking-[0.3em] mb-4"
                                style={{ color: "var(--vault-gold)" }}
                            >
                                Art Direction
                            </p>
                            <div
                                className="prose prose-sm max-w-none font-light leading-relaxed text-[15px]"
                                style={{ color: "var(--vault-muted)" }}
                            >
                                {artDirection.split("\n\n").map((para, i) => (
                                    <p key={i} className={i > 0 ? "mt-4" : ""}>
                                        {para}
                                    </p>
                                ))}
                            </div>
                        </section>

                        {/* ── Features / Specifications ────────────────────────── */}
                        {product.features.length > 0 && (
                            <>
                                <div className="h-px w-full mb-8" style={{ background: "var(--vault-border)" }} />
                                <section className="mb-10">
                                    <p
                                        className="text-[10px] font-mono uppercase tracking-[0.3em] mb-5"
                                        style={{ color: "var(--vault-gold)" }}
                                    >
                                        Specifications
                                    </p>
                                    <ul className="space-y-3">
                                        {product.features.map((feat, i) => (
                                            <li key={i} className="flex items-baseline gap-4">
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
                                                    style={{ background: "var(--vault-border)" }}
                                                />
                                                <span
                                                    className="text-sm font-light leading-relaxed"
                                                    style={{ color: "var(--vault-muted)" }}
                                                >
                                                    {feat}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </>
                        )}

                        {/* ── Price + CTA ──────────────────────────────────────── */}
                        <div className="h-px w-full mb-8" style={{ background: "var(--vault-border)" }} />

                        <div className="flex flex-col gap-6">
                            <div>
                                <p
                                    className="text-[9px] font-mono uppercase tracking-[0.3em] mb-2"
                                    style={{ color: "var(--vault-muted)" }}
                                >
                                    Investment
                                </p>
                                <p
                                    className="text-3xl font-light font-mono"
                                    style={{ color: "var(--vault-fg)" }}
                                >
                                    {formatted}
                                </p>
                                {isLimited && (
                                    <p
                                        className="text-[10px] font-mono mt-2"
                                        style={{ color: "var(--vault-muted)" }}
                                    >
                                        Stock is not guaranteed · White-glove delivery included
                                    </p>
                                )}
                            </div>

                            {/* CTA */}
                            <VaultActions productId={product.id} stock={product.stockQuantity} />

                            {/* Try in AR link */}
                            {product.modelUrl && (
                                <Link
                                    href={`/ar?id=${product.id}`}
                                    className="w-full py-4 text-[10px] font-mono uppercase tracking-[0.25em] text-center transition-colors duration-300 flex items-center justify-center gap-2"
                                    style={{ border: "1px solid var(--vault-border)", color: "var(--vault-gold)" }}
                                >
                                    <span>⬡</span> Try in AR
                                </Link>
                            )}

                            {/* Enquiry note */}
                            <p
                                className="text-[10px] font-mono text-center"
                                style={{ color: "var(--vault-muted)", opacity: 0.6 }}
                            >
                                Prefer to enquire first?{" "}
                                <Link
                                    href="/contact"
                                    className="underline underline-offset-4 transition-colors duration-300"
                                    style={{ color: "var(--vault-gold)" }}
                                >
                                    Contact the studio
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
