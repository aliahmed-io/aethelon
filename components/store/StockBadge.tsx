interface StockBadgeProps {
    stockQuantity: number;
    reservedStock: number;
    lowStockThreshold: number;
    allowBackorder: boolean;
}

/**
 * Storefront stock badge for product cards and detail pages.
 * Renders contextual badges: "Low Stock", "Backorder", or "Out of Stock".
 * Returns null when stock is healthy (no badge needed).
 */
export function StockBadge({
    stockQuantity,
    reservedStock,
    lowStockThreshold,
    allowBackorder,
}: StockBadgeProps) {
    const available = stockQuantity - reservedStock;

    if (available <= 0) {
        if (allowBackorder) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest rounded-sm bg-blue-100 text-blue-700 border border-blue-200">
                    Backorder
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest rounded-sm bg-red-100 text-red-700 border border-red-200">
                Out of Stock
            </span>
        );
    }

    if (available <= lowStockThreshold) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest rounded-sm bg-amber-100 text-amber-700 border border-amber-200">
                Low Stock
            </span>
        );
    }

    return null;
}
