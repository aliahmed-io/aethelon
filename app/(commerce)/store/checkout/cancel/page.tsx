import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart, HelpCircle } from "lucide-react";

export const metadata = {
    title: "Checkout Cancelled - Aethelon",
    description: "Your payment was not processed.",
};

export default function CheckoutCancelPage() {
    return (
        <div className="container flex items-center justify-center min-h-[60vh] py-12">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                    <CardTitle>Checkout Cancelled</CardTitle>
                    <CardDescription>
                        Your payment was not processed and you have not been charged.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Your items are still waiting for you in your cart.
                        If you encountered an error, please try again or use a different payment method.
                    </p>

                    <div className="grid gap-3">
                        <Link href="/bag">
                            <Button className="w-full">Return to Cart</Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" className="w-full">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Contact Support
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
