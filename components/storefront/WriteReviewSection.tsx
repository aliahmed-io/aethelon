import { ReviewForm } from "./ReviewForm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// This component is for the Write Review form only - goes under product image
export async function WriteReviewSection({ productId }: { productId: string }) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    return (
        <div className="py-8 border-t border-white/5">
            <h2 className="text-xl font-light uppercase tracking-tight text-white mb-6">Write a Review</h2>

            {user ? (
                <ReviewForm productId={productId} />
            ) : (
                <div className="bg-white/5 p-6 border border-white/10 rounded-sm text-center">
                    <p className="text-white/60 mb-4 text-sm">Please sign in to leave a review.</p>
                    <Button asChild className="bg-white text-black hover:bg-white/90">
                        <Link href="/api/auth/login">Sign In</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
