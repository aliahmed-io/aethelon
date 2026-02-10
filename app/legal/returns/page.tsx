import { TextPageLayout } from "@/components/layout/TextPageLayout";

export const metadata = {
    title: "Returns Policy | Aethelon",
};

export default function ReturnsPage() {
    return (
        <TextPageLayout
            title="Returns & Refunds"
            subtitle="Our commitment to your satisfaction."
        >
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-12">Last updated: January 2026</p>

            <h3>1. Eligibility Window</h3>
            <p>
                We accept returns of eligible items within 30 days of the delivery date.
                Items must be unused, in their original packaging, and in resellable condition.
            </p>

            <h3>2. Non-Returnable Items</h3>
            <p>
                Personalized goods and final-sale items are not eligible for return.
            </p>

            <h3>3. How to Request a Return</h3>
            <p>
                To initiate a return, please contact our concierge team with your order number.
                We will provide a prepaid shipping label for domestic returns.
            </p>

            <h3>4. Refunds</h3>
            <p>
                Refunds are processed to the original payment method within 5-7 days of inspection.
            </p>
        </TextPageLayout>
    );
}
