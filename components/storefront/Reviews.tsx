import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

export async function Reviews({ productId }: { productId: string }) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    return (
        <section className="py-12 border-t border-white/5 mt-12">
            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <h2 className="text-2xl font-light uppercase tracking-tight text-white mb-6">Reviews</h2>

                        {user ? (
                            <ReviewForm productId={productId} />
                        ) : (
                            <div className="bg-white/5 p-6 border border-white/10 rounded-sm text-center">
                                <p className="text-white/60 mb-4 text-sm">Please sign in to leave a review.</p>
                                <Button asChild className="w-full bg-white text-black hover:bg-white/90">
                                    <Link href="/api/auth/login">Sign In</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Recent Feedback</h3>
                    <Suspense fallback={<div className="text-white">Loading reviews...</div>}>
                        <ReviewList productId={productId} />
                    </Suspense>
                </div>
            </div>
        </section>
    );
}
