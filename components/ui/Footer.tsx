'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-primary text-primary-foreground pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <h2 className="font-display text-2xl tracking-widest font-bold">AETHELON</h2>
                        <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-xs">
                            Crafting sanctuaries for the modern soul. Sustainable luxury born from heritage and vision.
                        </p>
                    </div>

                    {/* Collections */}
                    <div>
                        <h3 className="font-bold mb-6 text-sm tracking-wider uppercase text-accent">Explore</h3>
                        <ul className="space-y-4 text-sm text-primary-foreground/70">
                            <li><Link href="/shop" className="hover:text-accent transition-colors">Collection</Link></li>
                            <li><Link href="/about" className="hover:text-accent transition-colors">Our Story</Link></li>
                            <li><Link href="/ai-search" className="hover:text-accent transition-colors">AI Search</Link></li>
                            <li><Link href="/ai-vision" className="hover:text-accent transition-colors">Room Visualizer</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold mb-6 text-sm tracking-wider uppercase text-accent">Support</h3>
                        <ul className="space-y-4 text-sm text-primary-foreground/70">
                            <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
                            <li><Link href="/legal/shipping" className="hover:text-accent transition-colors">Shipping & Returns</Link></li>
                            <li><Link href="/wholesale" className="hover:text-accent transition-colors">Wholesale</Link></li>
                            <li><Link href="/legal/returns" className="hover:text-accent transition-colors">Returns Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-bold mb-6 text-sm tracking-wider uppercase text-accent">Newsletter</h3>
                        <p className="text-sm text-primary-foreground/60 mb-4">
                            Subscribe for early access to new collections and exclusive offers.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-sm w-full focus:outline-none focus:border-accent transition-colors"
                            />
                            <button className="bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-white hover:text-primary transition-colors">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/40">
                    <p>© 2026 Aethelon Design. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
