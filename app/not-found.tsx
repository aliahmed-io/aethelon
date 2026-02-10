import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Display */}
                <div className="mb-8">
                    <span className="text-[200px] font-bold text-foreground/5 leading-none tracking-tighter select-none">
                        404
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground mb-4 -mt-24">
                    Page Not Found
                </h1>

                {/* Description */}
                <p className="text-muted-foreground font-light mb-8 max-w-md mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Let us help you find what you need.
                </p>

                {/* Quick Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    <Link
                        href="/"
                        className="group flex flex-col items-center gap-3 p-6 border border-border hover:border-accent/30 hover:bg-muted transition-all rounded-sm"
                    >
                        <Home className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">Home</span>
                    </Link>
                    <Link
                        href="/shop"
                        className="group flex flex-col items-center gap-3 p-6 border border-border hover:border-accent/30 hover:bg-muted transition-all rounded-sm"
                    >
                        <Search className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">Shop</span>
                    </Link>
                    <Link
                        href="/contact"
                        className="group flex flex-col items-center gap-3 p-6 border border-border hover:border-accent/30 hover:bg-muted transition-all rounded-sm"
                    >
                        <ArrowLeft className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">Contact</span>
                    </Link>
                </div>

                {/* Decorative Line */}
                <div className="flex items-center justify-center gap-4 text-muted-foreground/30">
                    <div className="h-px w-16 bg-border" />
                    <span className="text-[10px] uppercase tracking-widest">Aethelon</span>
                    <div className="h-px w-16 bg-border" />
                </div>
            </div>
        </div>
    );
}
