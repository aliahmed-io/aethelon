import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";
import LazyAuthScene from "@/components/auth/LazyAuthScene";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans bg-background">
      {/* LEFT PANEL - 3D Canvas Placeholder / Immersive Side */}
      <div className="relative hidden md:flex md:w-1/2 bg-foreground items-center justify-center p-8 overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.1)_0%,_transparent_50%)]" />
        
        <div className="absolute top-8 left-8 z-20">
          <Link href="/" className="text-muted-foreground hover:text-background transition-colors flex items-center gap-2 text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        
        <LazyAuthScene />
      </div>

      {/* RIGHT PANEL - Authentication Container */}
      <div className="w-full md:w-1/2 bg-background flex items-center justify-center p-8 md:p-16 lg:p-24 min-h-screen">
        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <Link href="/" className="md:hidden text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm uppercase tracking-widest mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="text-3xl font-serif tracking-tight text-destructive">
              Access Denied
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              We could not complete your sign-in or registration request. This may happen if the link expired, or if there was a connection error.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="w-full">
              <Magnetic strength={0.15} className="w-full block">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-3 rounded-sm border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-accent/50 hover:bg-secondary active:scale-[0.98]"
                >
                  Return to Login
                </Link>
              </Magnetic>
            </div>

            <div className="w-full">
              <Magnetic strength={0.1} className="w-full block">
                <Link
                  href="/register"
                  className="flex w-full items-center justify-center rounded-sm bg-foreground px-4 py-3 text-sm font-bold uppercase tracking-widest text-background shadow-md transition-all duration-200 hover:bg-foreground/90 active:scale-[0.98]"
                >
                  Try Signing Up Again
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
