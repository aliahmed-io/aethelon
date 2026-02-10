import prisma from "@/lib/db";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { isAdminEmail } from "@/lib/admin";
import { toggleReviewHidden } from "@/app/store/actions";
import { unstable_cache } from "next/cache";

// Cached review fetching - 60s per product
const getReviews = unstable_cache(
    async (productId: string, includeHidden: boolean) => {
        const data = await prisma.review.findMany({
            where: {
                productId: productId,
                ...(includeHidden ? {} : { isHidden: false }),
            },
            select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                isHidden: true,
                User: {
                    select: {
                        firstName: true,
                        profileImage: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return data;
    },
    ["reviews"],
    { revalidate: 60, tags: ["reviews"] }
);

export async function ReviewList({ productId }: { productId: string }) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const isAdmin = !!user?.email && isAdminEmail(user.email);

    const reviews = await getReviews(productId, isAdmin);

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {reviews.map((review) => (
                <div key={review.id} className="flex gap-4 border-b pb-6 last:border-b-0">
                    <Avatar>
                        <AvatarImage src={review.User.profileImage} alt={review.User.firstName} />
                        <AvatarFallback>{review.User.firstName.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold">{review.User.firstName}</p>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>
                            {isAdmin && review.isHidden && (
                                <p className="text-xs text-red-500 font-medium">Hidden</p>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">
                            {(() => {
                                try {
                                    const date = new Date(review.createdAt);
                                    if (isNaN(date.getTime())) return "Unknown date";
                                    return new Intl.DateTimeFormat("en-US", {
                                        dateStyle: "medium",
                                    }).format(date);
                                } catch {
                                    return "Unknown date";
                                }
                            })()}
                        </p>
                        <p className="mt-2 text-gray-700">{review.comment}</p>

                        {isAdmin && (
                            <form action={toggleReviewHidden.bind(null, review.id, productId)}>
                                <button
                                    type="submit"
                                    className="mt-2 text-xs font-medium text-blue-600 hover:underline"
                                >
                                    {review.isHidden ? "Unhide" : "Hide"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
