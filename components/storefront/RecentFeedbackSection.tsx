import { ReviewList } from "./ReviewList";
import { Suspense } from "react";

// This component is for Recent Feedback only - stays in the right column
export function RecentFeedbackSection({ productId }: { productId: string }) {
    return (
        <div className="border-t border-white/5 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Recent Feedback</h3>
            <Suspense fallback={<div className="text-white/40 text-sm">Loading reviews...</div>}>
                <ReviewList productId={productId} />
            </Suspense>
        </div>
    );
}
