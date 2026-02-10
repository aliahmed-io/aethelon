import { TextPageLayout } from "@/components/layout/TextPageLayout";

export const metadata = {
    title: "Shipping Policy | Aethelon",
};

export default function ShippingPage() {
    return (
        <TextPageLayout
            title="Shipping & Delivery"
            subtitle="Global logistics, handled with care."
        >
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-12">Last updated: January 2026</p>

            <h3>1. Processing Times</h3>
            <p>
                Orders are processed within 24-48 hours.
                Bespoke or personalized items may require additional time.
            </p>

            <h3>2. Global Delivery</h3>
            <p>
                We ship to over 50 countries via DHL Express.
                All shipments are fully insured and require signature upon delivery.
            </p>

            <h3>3. Tracking</h3>
            <p>
                You will receive a tracking number via email once your order has been dispatched.
            </p>

            <h3>4. Duties & Taxes</h3>
            <p>
                For most destinations, duties and taxes are calculated and collected at checkout (DDP).
            </p>
        </TextPageLayout>
    );
}
