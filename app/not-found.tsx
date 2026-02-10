import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Display */}
                <div className="mb-8">
                    <span className="text-[200px] font-bold text-white/5 leading-none tracking-tighter select-none">
                        404
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold uppercase tracking-tighter text-white mb-4 -mt-24">
                    Page Not Found
                </h1>

                {/* Description */}
                <p className="text-white/50 font-light mb-8 max-w-md mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Let us help you find what you need.
                </p>

                {/* Quick Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    <Link
                        href="/"
                        className="group flex flex-col items-center gap-3 p-6 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
                    >
                        <Home className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                        <span className="text-sm text-white/60 group-hover:text-white transition-colors uppercase tracking-widest">Home</span>
                    </Link>
                    <Link
                        href="/shop"
                        className="group flex flex-col items-center gap-3 p-6 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
                    >
                        <Search className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                        <span className="text-sm text-white/60 group-hover:text-white transition-colors uppercase tracking-widest">Shop</span>
                    </Link>
                    <Link
                        href="/contact"
                        className="group flex flex-col items-center gap-3 p-6 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                        <span className="text-sm text-white/60 group-hover:text-white transition-colors uppercase tracking-widest">Contact</span>
                    </Link>
                </div>

                {/* Decorative Line */}
                <div className="flex items-center justify-center gap-4 text-white/20">
                    <div className="h-px w-16 bg-white/10" />
                    <span className="text-[10px] uppercase tracking-widest">Velorum</span>
                    <div className="h-px w-16 bg-white/10" />
                </div>
            </div>
        </div>
    );
}
