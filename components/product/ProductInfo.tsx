import { Star, Truck, Ruler, ShieldCheck } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/Accordion";
import { Product } from "@prisma/client";

interface ProductInfoProps {
    product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
    return (
        <div className="flex flex-col h-full justify-center space-y-8 animate-in slide-in-from-left-8 duration-700 fade-in">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 text-xs font-bold tracking-[0.2em] uppercase bg-amber-500/10 text-amber-600 rounded-full ring-1 ring-amber-500/20">
                        {product.mainCategory || "Collection"}
                    </span>
                    {product.stockQuantity < 5 && product.stockQuantity > 0 && (
                        <span className="text-xs font-medium text-red-500 animate-pulse">
                            Only {product.stockQuantity} left
                        </span>
                    )}
                </div>

                <h1 className="text-5xl md:text-6xl font-light tracking-tight text-foreground leading-[1.1]">
                    {product.name}
                </h1>

                {/* Reviews Mock */}
                <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" className="text-amber-400/30" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">(4.8/5) 124 Reviews</span>
                </div>
            </div>

            {/* Description */}
            <div className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                <p>{product.description}</p>
            </div>

            {/* Details Accordion */}
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="dimensions">
                    <AccordionTrigger className="uppercase tracking-widest text-xs font-bold">
                        <div className="flex items-center gap-3">
                            <Ruler size={16} /> Dimensions
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                        <p>Height: 32" | Width: 84" | Depth: 38"</p>
                        <p className="mt-2 text-xs">Seat Height: 18"</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                    <AccordionTrigger className="uppercase tracking-widest text-xs font-bold">
                        <div className="flex items-center gap-3">
                            <Truck size={16} /> Shipping & Delivery
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                        <p>Free standard shipping on all orders over $2,000.</p>
                        <p className="mt-2">Estimated delivery: 3-5 business days.</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="warranty">
                    <AccordionTrigger className="uppercase tracking-widest text-xs font-bold">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={16} /> Warranty
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                        <p>Protected by Aethelon's 5-Year Craftsmanship Warranty.</p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
