import prisma from "@/lib/db";
import { StarRating } from "./StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistance } from "date-fns";

async function getReviews(productId: string) {
    const data = await prisma.review.findMany({
        where: { productId },
        include: { User: true },
        orderBy: { createdAt: "desc" },
    });
    return data;
}

export async function ReviewList({ productId }: { productId: string }) {
    const reviews = await getReviews(productId);

    if (reviews.length === 0) {
        return (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-sm">
                <p className="text-white/40 italic">No reviews yet. Be the first to share your experience.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-sm backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-white/10">
                                <AvatarImage src={review.User?.profileImage} />
                                <AvatarFallback className="bg-white/10 text-white text-xs">
                                    {review.User?.firstName?.slice(0, 1) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {review.User?.firstName || "Anonymous User"}
                                </p>
                                <p className="text-xs text-white/40">
                                    {formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <StarRating rating={review.rating} size={4} />
                    </div>

                    <p className="text-white/80 text-sm leading-relaxed font-light">
                        {review.comment}
                    </p>
                </div>
            ))}
        </div>
    );
}
