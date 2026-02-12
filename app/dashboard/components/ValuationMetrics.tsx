import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package } from "lucide-react";
import prisma from "@/lib/db";

async function getValuationData() {
    const products = await prisma.product.findMany({
        select: {
            stockQuantity: true,
            costPrice: true, // in cents
            price: true,     // in dollars (Wait, check schema interaction)
            // Schema says Price is Float? No, typically stored as Int/Float.
            // app/store/actions.ts says: price = Number(formData.get("price")) which is float from input.
            // Prisma schema says: price Float.
            // costPrice is Int (cents).
        }
    });

    let totalInventoryValue = 0; // Cost basis
    let totalRetailValue = 0;    // Potential revenue
    let totalItems = 0;

    products.forEach(p => {
        if (p.stockQuantity > 0) {
            totalItems += p.stockQuantity;
            totalInventoryValue += (p.stockQuantity * (p.costPrice / 100)); // Convert cents to dollars
            totalRetailValue += (p.stockQuantity * p.price);
        }
    });

    const potentialProfit = totalRetailValue - totalInventoryValue;
    const margin = totalRetailValue > 0 ? (potentialProfit / totalRetailValue) * 100 : 0;

    return {
        totalInventoryValue,
        totalRetailValue,
        potentialProfit,
        margin,
        totalItems
    };
}

export async function ValuationMetrics() {
    const data = await getValuationData();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inventory Valuation (Cost)</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${data.totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">
                        Total cost of goods on hand
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Retail Value</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${data.totalRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">
                        Potential revenue from stock
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Projected Margin</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.margin.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Potential Profit: ${data.potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
