'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearch } from '@/components/search/SearchContext';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { LoginLink } from '@kinde-oss/kinde-auth-nextjs/components';

interface NavbarProps {
    isAdmin?: boolean;
}

export default function Navbar({ isAdmin = false }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { openSearch } = useSearch();
    const { isAuthenticated } = useKindeBrowserClient();

    // ... (rest of hook logic) ...

    // (skip to return)

    // ... inside check ...


    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/shop', label: 'Shop' },
        { href: '/ai-search', label: 'AI Search' },
        { href: '/ai-vision', label: 'Room Visualizer' },
        { href: '/about', label: 'Story' },
    ];

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'py-4 bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
                    : 'py-6 bg-transparent'
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="z-50 relative group">
                    <span className="font-display text-2xl tracking-widest font-bold text-foreground">
                        AETHELON
                    </span>
                    <span className="block h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'text-sm font-medium tracking-wide transition-colors hover:text-accent relative py-2',
                                pathname === link.href ? 'text-accent' : 'text-muted-foreground'
                            )}
                        >
                            {link.label}
                            {pathname === link.href && (
                                <motion.div
                                    layoutId="navbar-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                                />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4 z-50">
                    <button
                        onClick={openSearch}
                        className="text-foreground hover:text-accent transition-colors p-2"
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <Link
                        href="/bag"
                        className="text-foreground hover:text-accent transition-colors p-2 relative"
                        aria-label="Cart"
                    >
                        <ShoppingBag className="w-5 h-5" />
                    </Link>
                    {isAuthenticated ? (
                        <Link href={isAdmin ? "/dashboard" : "/account"} className="text-foreground hover:text-accent transition-colors p-2" aria-label="Account">
                            <User className="w-5 h-5" />
                        </Link>
                    ) : (
                        <LoginLink className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
                            <User className="w-4 h-4" />
                            <span>Sign In</span>
                        </LoginLink>
                    )}
                    <button
                        className="md:hidden text-foreground hover:text-accent transition-colors p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: '100vh' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="fixed inset-0 bg-background pt-24 px-6 md:hidden overflow-hidden"
                    >
                        <nav className="flex flex-col gap-6 items-center">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-2xl font-display text-foreground hover:text-accent transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!isAuthenticated && (
                                <LoginLink className="mt-4 bg-accent text-accent-foreground px-8 py-3 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors">
                                    Sign In
                                </LoginLink>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
