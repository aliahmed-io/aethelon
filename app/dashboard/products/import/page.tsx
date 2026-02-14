import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { importProducts } from "./actions";

export default async function ImportProductsPage() {
    await requireAdmin();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Import Products</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Bulk CSV Import</CardTitle>
                    <CardDescription>
                        Paste your CSV data below.
                        Required Headers: <code>name, price, description, categoryId</code>.
                        Optional: <code>stockQuantity, status, images</code>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={importProducts as any} className="space-y-6">
                        <div className="space-y-2">
                            <Textarea
                                name="csvData"
                                placeholder="name,price,description,categoryId&#10;Premium Tee,2999,High quality cotton,UUID-HERE..."
                                className="min-h-[300px] font-mono text-sm"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="dryRun" name="dryRun" className="h-4 w-4 rounded border-gray-300" />
                                <label htmlFor="dryRun" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Dry Run (Validate Only)
                                </label>
                            </div>
                            <Button type="submit" className="ml-auto">
                                Run Import
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-sm">Template Format</CardTitle>
                </CardHeader>
                <CardContent className="text-xs font-mono">
                    name,price,description,categoryId,status,stockQuantity<br />
                    &quot;Summer Shirt&quot;,4500,&quot;Lightweight linen&quot;,cat_123,published,100<br />
                    &quot;Denim Jacket&quot;,8900,&quot;Classic wash&quot;,cat_123,draft,50
                </CardContent>
            </Card>
        </div >
    );
}
