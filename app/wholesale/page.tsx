// import prisma from "@/lib/db";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
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
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 lg:px-12 border-b border-white/10">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Building2 className="w-6 h-6 text-white/40" />
                        <span className="text-xs uppercase tracking-widest text-white/40">Business Partners</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-6">
                        Wholesale
                    </h1>
                    <p className="text-xl text-white/50 font-light max-w-2xl mb-12">
                        Partner with Aethelon Geneve for exclusive wholesale pricing, priority inventory access,
                        and dedicated account management.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 text-sm uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors"
                        >
                            Become a Partner
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                            href="#catalog"
                            className="inline-flex items-center gap-2 border border-white/20 px-8 py-4 text-sm uppercase tracking-widest hover:bg-white/5 transition-colors"
                        >
                            View Catalog
                        </a>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 px-6 lg:px-12 border-b border-white/10">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-xs uppercase tracking-widest text-white/40 mb-12">Partner Benefits</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-8 border border-white/10 hover:border-white/20 transition-colors group">
                            <Package className="w-8 h-8 text-white/20 mb-6 group-hover:text-white/40 transition-colors" />
                            <h3 className="text-lg font-medium mb-2">Bulk Pricing</h3>
                            <p className="text-sm text-white/40 leading-relaxed">
                                Tiered discounts up to 40% off retail for volume orders.
                            </p>
                        </div>
                        <div className="p-8 border border-white/10 hover:border-white/20 transition-colors group">
                            <Shield className="w-8 h-8 text-white/20 mb-6 group-hover:text-white/40 transition-colors" />
                            <h3 className="text-lg font-medium mb-2">Priority Access</h3>
                            <p className="text-sm text-white/40 leading-relaxed">
                                First access to new collections and limited editions.
                            </p>
                        </div>
                        <div className="p-8 border border-white/10 hover:border-white/20 transition-colors group">
                            <FileText className="w-8 h-8 text-white/20 mb-6 group-hover:text-white/40 transition-colors" />
                            <h3 className="text-lg font-medium mb-2">Net-30 Terms</h3>
                            <p className="text-sm text-white/40 leading-relaxed">
                                Invoice-based payments with flexible terms.
                            </p>
                        </div>
                        <div className="p-8 border border-white/10 hover:border-white/20 transition-colors group">
                            <Building2 className="w-8 h-8 text-white/20 mb-6 group-hover:text-white/40 transition-colors" />
                            <h3 className="text-lg font-medium mb-2">Dedicated Support</h3>
                            <p className="text-sm text-white/40 leading-relaxed">
                                Personal account manager for all your needs.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalog Preview */}
            <section id="catalog" className="py-20 px-6 lg:px-12 border-b border-white/10">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-xs uppercase tracking-widest text-white/40">Catalog Preview</h2>
                        <span className="text-xs text-white/30">Wholesale pricing shown after approval</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="group">
                                <div className="aspect-square bg-white/5 mb-4 relative overflow-hidden">
                                    {product.images[0] && (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="text-sm font-medium mb-1 truncate">{product.name}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-white/40">Retail: {formatPrice(product.price)}</p>
                                    <span className="text-[10px] uppercase tracking-widest text-white/30">
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
                        <p className="text-white/50">
                            Fill out the form below and our wholesale team will contact you within 48 hours.
                        </p>
                    </div>

                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                    Business Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-transparent border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="Your Company"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                    Contact Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-transparent border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="John Smith"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full bg-transparent border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="email@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    className="w-full bg-transparent border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                Estimated Monthly Order Volume
                            </label>
                            <select className="w-full bg-transparent border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors">
                                <option value="" className="bg-black">Select volume</option>
                                <option value="10-50" className="bg-black">10-50 units</option>
                                <option value="50-100" className="bg-black">50-100 units</option>
                                <option value="100-500" className="bg-black">100-500 units</option>
                                <option value="500+" className="bg-black">500+ units</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                                Message
                            </label>
                            <textarea
                                rows={4}
                                className="w-full bg-transparent border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
                                placeholder="Tell us about your business..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white text-black py-4 text-sm uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors"
                        >
                            Submit Application
                        </button>
                    </form>

                    {/* Direct Contact */}
                    <div className="mt-12 pt-12 border-t border-white/10 flex flex-wrap justify-center gap-8 text-sm text-white/40">
                        <a href="mailto:wholesale@aethelon.geneve.com" className="flex items-center gap-2 hover:text-white transition-colors">
                            <Mail className="w-4 h-4" />
                            wholesale@aethelon.geneve.com
                        </a>
                        <a href="tel:+41227001234" className="flex items-center gap-2 hover:text-white transition-colors">
                            <Phone className="w-4 h-4" />
                            +41 22 700 1234
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
