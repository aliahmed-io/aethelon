import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { unsubscribe } from "../actions";

export const metadata = {
    title: "Unsubscribe - Aethelon",
    description: "Manage your email preferences.",
};

export default function UnsubscribePage({ searchParams }: { searchParams: { email?: string } }) {
    return (
        <div className="container flex items-center justify-center min-h-[60vh] py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Unsubscribe</CardTitle>
                    <CardDescription>
                        We&apos;re sorry to see you go. Enter your email to stop receiving updates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={unsubscribe} className="space-y-4">
                        <Input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            defaultValue={searchParams.email || ""}
                            required
                        />
                        <Button type="submit" variant="destructive" className="w-full">
                            Unsubscribe
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
