// import prisma from "@/lib/db";
import Image from "next/image";
import { Building2, Package, FileText, Shield, ArrowRight, Phone, Mail } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Mock data for build verification
async function getWholesaleProducts() {
    return [
        {
            id: "1",
            name: "Aethelon Executive Desk",
            price: 4500,
            images: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=2000&auto=format&fit=crop"],
            stockQuantity: 150,
            mainCategory: "Office"
        },
        {
            id: "2",
            name: "Aethelon Lounge Chair",
            price: 2800,
            images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=2000&auto=format&fit=crop"],
            stockQuantity: 45,
            mainCategory: "Living"
        },
        {
            id: "3",
            name: "Minimalist Dining Table",
            price: 3200,
            images: ["https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=2000&auto=format&fit=crop"],
            stockQuantity: 80,
            mainCategory: "Dining"
        },
        {
            id: "4",
            name: "Nordic Bed Frame",
            price: 3500,
            images: ["https://images.unsplash.com/photo-1505693416388-b0346ef3e498?q=80&w=2000&auto=format&fit=crop"],
            stockQuantity: 60,
            mainCategory: "Bedroom"
        }
    ];
}

export default async function WholesalePage() {
    const products = await getWholesaleProducts();

    return (
        <main className="min-h-screen bg-background text-foreground">

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 lg:px-12 border-b border-border">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-widest text-muted-foreground">Business Partners</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-6">
                        Wholesale
                    </h1>
                    <p className="text-xl text-muted-foreground font-light max-w-2xl mb-12">
                        Partner with Aethelon Geneve for exclusive wholesale pricing, priority inventory access,
                        and dedicated account management.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 text-sm uppercase tracking-widest font-bold hover:bg-accent/90 transition-colors rounded-sm"
                        >
                            Become a Partner
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                            href="#catalog"
                            className="inline-flex items-center gap-2 border border-border px-8 py-4 text-sm uppercase tracking-widest hover:bg-muted transition-colors rounded-sm"
                        >
                            View Catalog
                        </a>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 px-6 lg:px-12 border-b border-border">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-12">Partner Benefits</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-8 border border-border hover:border-accent/30 transition-colors group rounded-sm">
                            <Package className="w-8 h-8 text-muted-foreground/40 mb-6 group-hover:text-accent transition-colors" />
                            <h3 className="text-lg font-medium mb-2">Bulk Pricing</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Tiered discounts up to 40% off retail for volume orders.
                            </p>
                        </div>
                        <div className="p-8 border border-border hover:border-accent/30 transition-colors group rounded-sm">
                            <Shield className="w-8 h-8 text-muted-foreground/40 mb-6 group-hover:text-accent transition-colors" />
                            <h3 className="text-lg font-medium mb-2">Priority Access</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                First access to new collections and limited editions.
                            </p>
                        </div>
                        <div className="p-8 border border-border hover:border-accent/30 transition-colors group rounded-sm">
                            <FileText className="w-8 h-8 text-muted-foreground/40 mb-6 group-hover:text-accent transition-colors" />
                            <h3 className="text-lg font-medium mb-2">Net-30 Terms</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Invoice-based payments with flexible terms.
                            </p>
                        </div>
                        <div className="p-8 border border-border hover:border-accent/30 transition-colors group rounded-sm">
                            <Building2 className="w-8 h-8 text-muted-foreground/40 mb-6 group-hover:text-accent transition-colors" />
                            <h3 className="text-lg font-medium mb-2">Dedicated Support</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Personal account manager for all your needs.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalog Preview */}
            <section id="catalog" className="py-20 px-6 lg:px-12 border-b border-border">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Catalog Preview</h2>
                        <span className="text-xs text-muted-foreground/60">Wholesale pricing shown after approval</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="group">
                                <div className="aspect-square bg-muted mb-4 relative overflow-hidden rounded-sm">
                                    {product.images[0] && (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="text-sm font-medium mb-1 truncate">{product.name}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">Retail: {formatPrice(product.price)}</p>
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                        {product.stockQuantity} units
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section id="contact" className="py-20 px-6 lg:px-12">
                <div className="container mx-auto max-w-2xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tighter mb-4">Become a Partner</h2>
                        <p className="text-muted-foreground">
                            Fill out the form below and our wholesale team will contact you within 48 hours.
                        </p>
                    </div>

                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors rounded-sm"
                                    placeholder="Your Company"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                                    Contact Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors rounded-sm"
                                    placeholder="John Smith"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors rounded-sm"
                                    placeholder="email@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    className="w-full bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors rounded-sm"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                                Estimated Monthly Order Volume
                            </label>
                            <select className="w-full bg-background border border-border px-4 py-3 text-foreground focus:outline-none focus:border-accent transition-colors rounded-sm">
                                <option value="">Select volume</option>
                                <option value="10-50">10-50 units</option>
                                <option value="50-100">50-100 units</option>
                                <option value="100-500">100-500 units</option>
                                <option value="500+">500+ units</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                                Message
                            </label>
                            <textarea
                                rows={4}
                                className="w-full bg-background border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent transition-colors resize-none rounded-sm"
                                placeholder="Tell us about your business..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-accent text-accent-foreground py-4 text-sm uppercase tracking-widest font-bold hover:bg-accent/90 transition-colors rounded-sm"
                        >
                            Submit Application
                        </button>
                    </form>

                    {/* Direct Contact */}
                    <div className="mt-12 pt-12 border-t border-border flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                        <a href="mailto:wholesale@aethelon.geneve.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <Mail className="w-4 h-4" />
                            wholesale@aethelon.geneve.com
                        </a>
                        <a href="tel:+41227001234" className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <Phone className="w-4 h-4" />
                            +41 22 700 1234
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
