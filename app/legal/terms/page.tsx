import { TextPageLayout } from "@/components/layout/TextPageLayout";

export const metadata = {
    title: "Terms of Service | Aethelon",
};

export default function TermsPage() {
    return (
        <TextPageLayout
            title="Terms of Service"
            subtitle="Governing your use of the Aethelon platform."
        >
            <p className="text-sm uppercase tracking-widest text-white/40 mb-12">Last updated: January 2026</p>

            <h3>1. Overview</h3>
            <p>
                These Terms of Service (&quot;Terms&quot;) govern your use of the Aethelon storefront.
                By accessing or using the Service, you agree to be bound by these Terms.
            </p>

            <h3>2. Orders & Payments</h3>
            <p>
                All orders are subject to availability.
                Prices and promotions may change at any time.
                Payments are processed securely via Stripe.
            </p>

            <h3>3. Shipping & Delivery</h3>
            <p>
                Delivery times are estimates. Risk of loss transfers to you upon handover to the carrier.
                International shipping may be subject to customs duties.
            </p>

            <h3>4. Returns & Refunds</h3>
            <p>
                Please refer to our Returns Policy for details.
                Returns are accepted within 30 days of delivery for unworn items.
            </p>

            <h3>5. Contact</h3>
            <p>
                For legal inquiries, please contact legal@aethelon.geneve.com.
            </p>
        </TextPageLayout>
    );
}
