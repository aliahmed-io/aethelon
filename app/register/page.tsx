import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";
import LazyAuthScene from "@/components/auth/LazyAuthScene";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans bg-background">
      {/* LEFT PANEL - 3D Canvas Placeholder / Immersive Side */}
      <div className="relative hidden md:flex md:w-1/2 bg-foreground items-center justify-center p-8 overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(201,145,43,0.1)_0%,_transparent_50%)]" />
        
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
            <h1 className="text-3xl font-serif text-foreground tracking-tight">
              Create an Account
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Join Aethelon to access your curated collection and exclusive vault pieces.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="w-full">
              <Magnetic strength={0.15} className="w-full block">
                <RegisterLink
                  authUrlParams={{
                    connection_id: "conn_019ac8fa661c8891a110c5ea8b4f6dc7"
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-sm border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-accent/50 hover:bg-secondary active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </RegisterLink>
              </Magnetic>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-background px-3 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="w-full">
              <Magnetic strength={0.1} className="w-full block">
                <RegisterLink
                  className="flex w-full items-center justify-center rounded-sm bg-foreground px-4 py-3 text-sm font-bold uppercase tracking-widest text-background shadow-md transition-all duration-200 hover:bg-foreground/90 active:scale-[0.98]"
                >
                  Sign up with Email
                </RegisterLink>
              </Magnetic>
            </div>
          </div>

          <div className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-foreground hover:text-accent transition-colors underline-offset-4 hover:underline">
                Log in
              </Link>
            </p>
          </div>

          <div className="pt-4 text-center">
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              By creating an account, you agree to Aethelon's{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
