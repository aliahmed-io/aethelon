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
                        <h3 className="font-bold mb-6 text-sm tracking-wider uppercase text-accent">Collections</h3>
                        <ul className="space-y-4 text-sm text-primary-foreground/70">
                            <li><Link href="/shop/living" className="hover:text-accent transition-colors">Living Room</Link></li>
                            <li><Link href="/shop/dining" className="hover:text-accent transition-colors">Dining</Link></li>
                            <li><Link href="/shop/bedroom" className="hover:text-accent transition-colors">Bedroom</Link></li>
                            <li><Link href="/shop/workspace" className="hover:text-accent transition-colors">Workspace</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold mb-6 text-sm tracking-wider uppercase text-accent">Support</h3>
                        <ul className="space-y-4 text-sm text-primary-foreground/70">
                            <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
                            <li><Link href="/shipping" className="hover:text-accent transition-colors">Shipping & Returns</Link></li>
                            <li><Link href="/care" className="hover:text-accent transition-colors">Product Care</Link></li>
                            <li><Link href="/faq" className="hover:text-accent transition-colors">FAQ</Link></li>
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
                    <p>© 2024 Aethelon Design. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
