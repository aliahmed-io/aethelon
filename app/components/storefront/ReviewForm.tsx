"use client";

import { useActionState } from "react";
import { createReview } from "@/app/store/actions";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { reviewSchema } from "@/lib/zodSchemas";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId }: { productId: string }) {
    const [lastResult, action] = useActionState(createReview, undefined);
    const [form, fields] = useForm({
        lastResult: lastResult as any,
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: reviewSchema });
        },
        shouldValidate: "onBlur",
        shouldRevalidate: "onInput",
    });

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <form id={form.id} onSubmit={form.onSubmit} action={action} className="space-y-6 bg-white/5 p-6 border border-white/10 rounded-sm backdrop-blur-sm">
            <h3 className="text-lg font-light uppercase tracking-widest text-white">Write a Review</h3>

            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name={fields.rating.name} value={rating} />

            <div className="space-y-2">
                <span className="text-sm text-white/60 uppercase tracking-wider">Your Rating</span>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform active:scale-95"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                        >
                            <Star
                                className={cn(
                                    "w-6 h-6 transition-colors duration-200",
                                    (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-white/20"
                                )}
                                strokeWidth={1.5}
                            />
                        </button>
                    ))}
                </div>
                <p className="text-red-400 text-xs">{fields.rating.errors}</p>
            </div>

            <div className="space-y-2">
                <span className="text-sm text-white/60 uppercase tracking-wider">Your Experience</span>
                <textarea
                    name={fields.comment.name}
                    key={fields.comment.key}
                    defaultValue={fields.comment.initialValue as string}
                    placeholder="Share your thoughts about this timepiece..."
                    className="w-full bg-black/40 border border-white/10 rounded-sm p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 min-h-[120px] text-sm"
                />
                <p className="text-red-400 text-xs">{fields.comment.errors}</p>
            </div>

            <SubmitButton text="Post Review" className="w-full bg-white text-black hover:bg-white/90" />
        </form>
    );
}
