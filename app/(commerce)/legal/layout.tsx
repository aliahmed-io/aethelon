import Link from "next/link";
import { Button } from "@/components/ui/button";

const legalLinks = [
    { name: "Privacy Policy", href: "/legal/privacy" },
    { name: "Terms of Service", href: "/legal/terms" },
    { name: "Cookie Policy", href: "/legal/cookies" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="container py-12">
            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Legal</h3>
                    <nav className="flex flex-col space-y-2">
                        {legalLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                                <Button variant="ghost" className="w-full justify-start">
                                    {link.name}
                                </Button>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="lg:col-span-3 prose dark:prose-invert max-w-none">
                    {children}
                </div>
            </div>
        </div>
    );
}
