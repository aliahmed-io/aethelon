import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function UnsubscribeSuccessPage() {
    return (
        <div className="container flex items-center justify-center min-h-[60vh] py-12">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <CardTitle>Unsubscribed Successfully</CardTitle>
                    <CardDescription>
                        You have been removed from our mailing list.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/">
                        <Button variant="outline">Return to Home</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
